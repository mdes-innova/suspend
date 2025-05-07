'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentUpload() {
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground">
                Title
            </label>
            <input
                type="text"
                name="title"
                required
                className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
                placeholder="Document title here..."
            />
            </div>

            <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
            </label>
            <input
                type="password"
                name="password"
                required
                className="mt-1 text-foreground w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-border"
                placeholder=""
            />
            </div>

            <div>
            <button
                type="submit"
                className="w-full bg-chart-1 text-foregroud py-2 rounded-xl hover:ring hover:ring-border transition duration-300"
            >
                Sign In
            </button>
            </div>
            {true && <div className="text-destructive">{errorMessage}</div>}
        </form>
        // <div>
        // <h1>Upload File to Document #{id}</h1>
        // <form onSubmit={handleUpload}>
        //     <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" required />
        //     <button type="submit">Upload</button>
        // </form>
        // <p>{message}</p>
        // </div>
  );
}