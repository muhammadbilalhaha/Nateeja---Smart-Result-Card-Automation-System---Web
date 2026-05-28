// ********************************** Library Imports ******************************************
import * as XLSX from 'xlsx';

// ********************************** Main Export - Process Excel File ******************************************
export function processExcelFile(fileBuffer, options = {}) {
    const { passingPercentage = 33, subjectsToFail = 1 } = options;

    return new Promise((resolve, reject) => {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log('Raw data rows:', jsonData.length);
            const processedData = processStudentData(jsonData, passingPercentage, subjectsToFail);
            resolve(processedData);
        } catch (error) {
            console.error('Excel processing error:', error);
            reject(new Error('Failed to process Excel file: ' + error.message));
        }
    });
}

// ********************************** Find Column Index Helper ******************************************
function findColumnIndex(headers, patterns, excludePatterns = []) {
    // Exact match first
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header === undefined || header === null || header === '') continue;
        const h = String(header).toLowerCase().trim();

        // Check if this header should be excluded
        let excluded = false;
        for (const exclude of excludePatterns) {
            if (h.includes(exclude)) {
                excluded = true;
                break;
            }
        }
        if (excluded) continue;

        for (const pattern of patterns) {
            if (h === pattern) {
                return i;
            }
        }
    }
    
    // Fallback: partial match
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header === undefined || header === null || header === '') continue;
        const h = String(header).toLowerCase().trim();
        
        let excluded = false;
        for (const exclude of excludePatterns) {
            if (h.includes(exclude)) {
                excluded = true;
                break;
            }
        }
        if (excluded) continue;

        for (const pattern of patterns) {
            if (h.includes(pattern)) {
                return i;
            }
        }
    }
    return -1;
}

// ********************************** Process Student Data Function ******************************************
function processStudentData(rawData, passingPercentage = 33, subjectsToFail = 1) {
    // ********************************** Validation ******************************************
    if (!rawData || rawData.length < 2) {
        throw new Error('Excel file must contain headers and at least one student');
    }

    const headers = rawData[0].map(h => h?.toString().trim() || '');
    console.log('Headers:', headers);
    console.log('Header count:', headers.length);

    // ********************************** Column Detection ******************************************
    // Detect Father Name FIRST (so it's excluded from Name detection)
    const fatherNameIdx = findColumnIndex(headers, ['father', "father's name", 'father name', 'parent', 'guardian']);

    // Then detect Name, EXCLUDING headers that contain "father"
    const nameIdx = findColumnIndex(headers, ['name', 'student name', 'student'], ['father', 'parent', 'guardian']);

    // Detect other columns
    const rollNoIdx = findColumnIndex(headers, ['roll', 'roll no', 'roll number', 'rollno', 'r.no', 'roll #']);
    const classIdx = findColumnIndex(headers, ['class', 'grade', 'class/grade']);
    const sectionIdx = findColumnIndex(headers, ['section', 'sec']);

    console.log('Column indices:', { nameIdx, rollNoIdx, classIdx, fatherNameIdx, sectionIdx });

    // ********************************** Fixed Column Indices ******************************************
    const fixedIndices = new Set();
    if (nameIdx >= 0) fixedIndices.add(nameIdx);
    if (rollNoIdx >= 0) fixedIndices.add(rollNoIdx);
    if (classIdx >= 0) fixedIndices.add(classIdx);
    if (fatherNameIdx >= 0) fixedIndices.add(fatherNameIdx);
    if (sectionIdx >= 0) fixedIndices.add(sectionIdx);

    // Verify we found at least name column
    if (nameIdx < 0) {
        console.warn('Name column not found, using column 0 as name');
        fixedIndices.add(0);
    }

    // ********************************** Subject Columns Detection ******************************************
    const subjectColumns = [];
    headers.forEach((header, index) => {
        if (!fixedIndices.has(index) && header && header.trim() !== '') {
            subjectColumns.push({
                name: header.trim() || `Subject ${subjectColumns.length + 1}`,
                index: index,
            });
        }
    });

    console.log('Subject columns:', subjectColumns.map(s => s.name));
    console.log('Total subjects:', subjectColumns.length);

    if (subjectColumns.length === 0) {
        throw new Error('No subject columns found in the Excel file. Headers: ' + headers.join(', '));
    }

    // ********************************** Cell Value Getter ******************************************
    const getCell = (row, index) => {
        if (index < 0 || index >= row.length) return '';
        const val = row[index];
        if (val === undefined || val === null) return '';
        return String(val).trim();
    };

    // ********************************** Student Data Processing ******************************************
    const students = [];
    for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const hasData = row.some(cell => cell !== null && cell !== undefined && cell !== '');
        if (!hasData) continue;

        try {
            const student = {
                name: nameIdx >= 0 ? getCell(row, nameIdx) : getCell(row, 0),
                rollNo: rollNoIdx >= 0 ? getCell(row, rollNoIdx) : '',
                className: classIdx >= 0 ? getCell(row, classIdx) : '',
                fatherName: fatherNameIdx >= 0 ? getCell(row, fatherNameIdx) : '',
                section: sectionIdx >= 0 ? getCell(row, sectionIdx) : '',
                subjects: [],
                totalObtained: 0,
                totalMarks: 0,
                percentage: 0,
                grade: '',
                status: 'PASS',
                position: null,
                rank: null,
                totalStudents: 0,
            };

            // ********************************** Subject Marks Processing ******************************************
            subjectColumns.forEach((subjectCol) => {
                const rawValue = row[subjectCol.index];
                const isEmpty = rawValue === undefined || rawValue === null ||
                    (typeof rawValue === 'string' && rawValue.trim() === '') ||
                    (typeof rawValue === 'number' && isNaN(rawValue));

                const obtainedMarks = isEmpty ? null : (parseFloat(rawValue) || 0);
                const maxMarks = 100;

                student.subjects.push({
                    name: subjectCol.name,
                    obtainedMarks: obtainedMarks,
                    maxMarks,
                    isEmpty: isEmpty,
                    percentage: maxMarks > 0 && obtainedMarks !== null ? ((obtainedMarks / maxMarks) * 100).toFixed(2) : 0
                });

                if (obtainedMarks !== null) {
                    student.totalObtained += obtainedMarks;
                    student.totalMarks += maxMarks;
                }
            });

            // ********************************** Calculate Overall Results ******************************************
            student.percentage = student.totalMarks > 0
                ? ((student.totalObtained / student.totalMarks) * 100).toFixed(2)
                : 0;

            student.grade = calculateGrade(student.percentage);
            student.status = checkPassFail(student.subjects, passingPercentage, subjectsToFail);

            students.push(student);
        } catch (rowError) {
            console.error(`Error processing row ${i}:`, rowError);
        }
    }

    console.log('Processed students:', students.length);
    if (students.length > 0) {
        console.log('First student:', JSON.stringify({
            name: students[0]?.name,
            fatherName: students[0]?.fatherName,
            rollNo: students[0]?.rollNo,
            className: students[0]?.className,
            subjectCount: students[0]?.subjects.length,
            firstSubject: students[0]?.subjects[0]?.name,
            percentage: students[0]?.percentage,
        }));
    }

    const passCount = students.filter(s => s.status === 'PASS').length;
    const failCount = students.filter(s => s.status === 'FAIL').length;
    console.log(`Pass: ${passCount}, Fail: ${failCount}`);

    // ********************************** Assign Class Positions ******************************************
    if (students.length > 0) {
        try {
            assignPositions(students);
        } catch (posError) {
            console.error('Position assignment error:', posError);
        }
    }

    // ********************************** Return Processed Data ******************************************
    return {
        students,
        totalStudents: students.length,
        subjects: subjectColumns.map(s => s.name),
        subjectCount: subjectColumns.length,
        passingPercentage,
        subjectsToFail,
        hasFatherName: fatherNameIdx >= 0,
    };
}

// ********************************** Assign Class Positions Function ******************************************
function assignPositions(students) {
    if (students.length === 0) return;
    const sorted = [...students].sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    let currentRank = 1, prevPercentage = null, sameCount = 0;

    sorted.forEach((student, index) => {
        const currentPct = parseFloat(student.percentage);
        if (index === 0) { student.position = currentRank; }
        else if (currentPct === prevPercentage) { sameCount++; student.position = currentRank; }
        else { currentRank = currentRank + sameCount + 1; sameCount = 0; student.position = currentRank; }

        student.rank = student.position;
        student.totalStudents = students.length;

        if (student.position > 3) student.position = null;
        prevPercentage = currentPct;
    });
}

// ********************************** Calculate Grade Function ******************************************
function calculateGrade(percentage) {
    const percent = parseFloat(percentage);
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B+';
    if (percent >= 60) return 'B';
    if (percent >= 50) return 'C';
    if (percent >= 40) return 'D';
    return 'F';
}

// ********************************** Check Pass/Fail Function ******************************************
function checkPassFail(subjects, passingPercentage = 33, subjectsToFail = 1) {
    const failedSubjects = subjects.filter(subject => {
        if (subject.maxMarks === 0 || subject.obtainedMarks === null) return false;
        const passPercentage = (subject.obtainedMarks / subject.maxMarks) * 100;
        return passPercentage < passingPercentage;
    });
    return failedSubjects.length >= subjectsToFail ? 'FAIL' : 'PASS';
}