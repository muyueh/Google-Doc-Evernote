
console.log('Background service worker started.');

chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked.');

    // Execute script to get selected text
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        },
        (results) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                showNotification('Error', 'Failed to retrieve selected text.');
                return;
            }

            const selectedText = results && results[0] && results[0].result ? results[0].result.trim() : '';

            if (!selectedText) {
                console.warn('No text selected.');
                showNotification('No Text Selected', 'Please select some text on the page before saving.');
                return;
            }

            console.log('Selected text:', selectedText);
            console.log('Current tab URL:', tab.url);

            // Send the text and URL to Google Sheets
            sendDataToGoogleSheets(selectedText, tab.url);
        }
    );
});

/**
 * Sends the selected text and website URL to the Google Sheets via Google Apps Script.
 * @param {string} text - The selected text.
 * @param {string} website - The URL of the current tab.
 */
function sendDataToGoogleSheets(text, website) {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwNymh0ke2brkuMz5RwZhixM0ZBMiEnNxNGEIwLLRqSxL_sOgAfF-T6DzvRfc0nLkis/exec'; // Your Google Apps Script Web App URL

    fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text, website: website })
    })
    .then(response => {
        console.log('Background received response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok. Status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.status) {
            throw new Error('Invalid response from Google Apps Script.');
        }
        console.log('Background parsed JSON data:', data);
        if (data.status === 'success') {
            showNotification('Success', 'Data saved to Google Sheets successfully.');
        } else {
            throw new Error(data.message || 'Unknown error.');
        }
    })
    .catch(error => {
        console.error('Background fetch error:', error);
        showNotification('Error', error.message);
    });
}

/**
 * Displays a notification to the user.
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 */
function showNotification(title, message) {
    // Simple 16x16 transparent PNG as a data URL
    const iconDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABGUlEQVQ4T6WTsUoDQRSGn7Obo7KxuKDBsE0uAuqiKCAupBQk4IUBSEGd4BFQEakVAIipBSEsF1BQUEwslL4HEt1pOXuG+V2R5s7M7M3s5r3nHvO8Mkc2gqRuob1xctYmCAZEkDVyB5+GVZBJhgfIyh8B2SAxdBsI7LzkDJoWmGKMJ9Di1I5bZwTmEI56+X+DzKK3A7WPlRrNdbZyBEARvTwVxv4RVNwFqOMd+qhwEbSmdZijD4AdYaoTi4hAzFLeBjvWAU04U5tLYk0wvk5YCiO2W2s0tQEYjVTCp+6qC+l8lFEkYYtj4B1juxKy68mZJvBHbiEYfERLLCz4Xz7FdzHcgIf4rUAAAAASUVORK5CYII=';

    chrome.notifications.create({
        type: 'basic',
        iconUrl: iconDataUrl,
        title: title,
        message: message
    }, function(notificationId) {
        console.log('Notification shown:', notificationId);
    });
}
