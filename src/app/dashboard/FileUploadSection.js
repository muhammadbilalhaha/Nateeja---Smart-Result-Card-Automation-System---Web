"use client";

// ********************************** Library Imports ******************************************
import React from "react";
import { Upload, FileText } from 'lucide-react';

export default function FileUploadSection({
    getRootProps,
    getInputProps,
    isDragActive,
    isFileLoaded,
    fileName,
    error,
    isProcessing,
    onPreview,
    onGenerate,
    onClear
}) {
    // ********************************** Component Render ******************************************
    return (
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
            {/* ********************************** Upload Header ****************************************** */}
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-800">Upload Data</h2>
                    <span className="text-xs font-bold tracking-wider text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase">Step 1 of 3</span>
                </div>

                {/* ********************************** Dropzone Area ****************************************** */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragActive ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-400 bg-slate-50/50"
                        } min-h-[340px]`}
                >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shadow-slate-100 mb-6 group-hover:scale-105 transition-transform">
                        <Upload className="w-7 h-7 text-[#0256b1]" />
                    </div>

                    {/* ********************************** Dropzone States ****************************************** */}
                    {isDragActive ? (
                        <h3 className="text-xl font-bold text-blue-600 mb-2">Drop your Excel file here</h3>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop your Excel file here</h3>
                            <p className="text-sm text-slate-400 mb-8">Supports .xlsx and .xls formats</p>
                            <button className="flex items-center gap-2 bg-[#0256b1] hover:bg-[#01448e] text-white font-semibold px-6 py-3.5 rounded-xl shadow-md transition-colors">
                                <FileText className="w-5 h-5" />
                                Import Excel File
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ********************************** File Status Section ****************************************** */}
            <div className="mt-6">
                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-xs font-medium mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
                    </div>
                )}
                {isFileLoaded && !error && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-medium mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> File loaded: {fileName}
                    </div>
                )}
                {!isFileLoaded && !error && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> No file loaded
                    </div>
                )}
            </div>

            {/* ********************************** Action Buttons ****************************************** */}
            {isFileLoaded && !error && (
                <div className="mt-4 flex gap-3">
                    <button onClick={onPreview} disabled={isProcessing}
                        className="flex-1 bg-[#0256b1] hover:bg-[#01448e] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                        {isProcessing ? 'Processing...' : 'Preview Data'}
                    </button>
                    <button onClick={onGenerate} disabled={isProcessing}
                        className="flex-1 border-2 border-[#0256b1] text-[#0256b1] hover:bg-[#0256b1] hover:text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                        {isProcessing ? 'Processing...' : 'Generate PDF'}
                    </button>
                    <button onClick={onClear} className="text-slate-400 hover:text-slate-600 text-sm px-3">Clear</button>
                </div>
            )}
        </section>
    );
}