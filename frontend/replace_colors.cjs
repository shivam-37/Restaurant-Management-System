const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/shiwa/OneDrive/Desktop/Restaurant-Management-System/frontend/src';

const replacements = {
    'bg-indigo-600': 'bg-[#f97316]',
    'text-indigo-600': 'text-[#f97316]',
    'bg-indigo-500': 'bg-orange-500',
    'text-indigo-500': 'text-[#f97316]',
    'border-indigo-500': 'border-[#f97316]',
    'border-indigo-600': 'border-[#f97316]',
    'focus:ring-indigo-500': 'focus:ring-orange-500',
    'focus:border-indigo-500': 'focus:border-[#f97316]',
    'shadow-indigo-600': 'shadow-orange-500',
    'bg-red-600': 'bg-[#f97316]',
    'bg-red-700': 'bg-orange-600',
    'text-red-600': 'text-[#f97316]',
    'border-red-600': 'border-[#f97316]',
    'focus:ring-red-500': 'focus:ring-orange-500',
    'focus:border-red-500': 'focus:border-[#f97316]',
    'shadow-red-600': 'shadow-orange-500',
    'text-red-500': 'text-orange-500',
    'bg-red-500': 'bg-orange-500',
};

// Also replace rounded classes to rounded-3xl where rounded-lg or rounded-xl or rounded-2xl or rounded-md is used?
// No, standardizing colors is enough to make it "similar". The user might not want ALL corners perfectly rounded.

function replaceInFile(filePath) {
    if (filePath.includes('OwnerDashboard.jsx') || filePath.includes('LandingPage.jsx')) {
        return; // Skip these as they are already customized
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
            content = content.split(key).join(value);
            changed = true;
        }
    }

    // specific replacement for UserDashboard to ensure dark mode
    if (filePath.includes('UserDashboard.jsx')) {
        if (content.includes('bg-gray-50 dark:bg-gray-900')) {
            content = content.replace(/bg-gray-50 dark:bg-gray-900/g, 'bg-[#0a0a0a] text-white');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(directory);
console.log('Color replacement complete.');
