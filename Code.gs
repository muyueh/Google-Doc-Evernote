const SHEET_ID = '1Pl-0b93aHdXMP9fweA6Xc4qr9o2dFsif3RIGvFulYTA'; // Replace with your Google Sheets ID

/**
 * Handles HTTP POST requests to append data to a Google Sheet with CORS support.
 * @param {Object} e - The event parameter containing request data.
 * @returns {ContentService.TextOutput} - JSON response with status and message.
 */
function doPost(e) {
  try {
    // Ensure POST data exists
    if (!e.postData || !e.postData.contents) {
      throw new Error('No data received.');
    }

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    const text = data.text;
    const website = data.website;

    // Validate the 'text' and 'website' fields
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid or missing "text" field.');
    }
    if (!website || typeof website !== 'string') {
      throw new Error('Invalid or missing "website" field.');
    }

    // Append the data to the Google Sheets document
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const timestamp = new Date();
    sheet.appendRow([text, website, timestamp]);

    // Return a success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully.' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*', // For development; restrict in production
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error in doPost:', error);

    // Return an error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*', // For development; restrict in production
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 * @param {Object} e - The event parameter containing request data.
 * @returns {ContentService.TextOutput} - Empty response with CORS headers.
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*', // For development; restrict in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
