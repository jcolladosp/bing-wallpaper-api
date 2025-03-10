import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const endpoint =
  'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10&mkt=en-US';
const KV_NAMESPACE = 'BING_WALLPAPER_KV'; // Your KV namespace id
const KV_KEY = 'wallpaper_data';

async function updateKV() {
  try {
    console.log('Fetching new images from Bing...');
    const response = await fetch(endpoint);
    const { images } = (await response.json()) as { images: any[] };

    // Get current data from KV
    console.log('Reading existing data from KV...');
    const { stdout } = await execAsync(
      `npx wrangler kv:get --binding=${KV_NAMESPACE} ${KV_KEY}`
    );

    // Parse data (handle if it's empty/not found)
    let result = [];
    try {
      result = JSON.parse(stdout || '[]');
    } catch (error) {
      console.log(
        'No existing data found or invalid format, creating new dataset'
      );
    }

    // Process new images
    const newData = images
      .filter(
        (item) => !result.find(({ startdate }) => item.startdate === startdate)
      )
      .map((item) => ({
        startdate: item.startdate,
        copyright: item.copyright,
        urlbase: item.urlbase,
        title: item.title,
      }));

    console.log(`Found ${newData.length} new images`);

    if (newData.length === 0) {
      console.log('No new data to update');
      return;
    }

    // Add new data and sort
    result.push(...newData);
    result.sort((a, b) => b.startdate.localeCompare(a.startdate));

    // Write updated data to KV
    console.log('Updating KV store...');

    // Create a temporary file for the data
    const tempFile = `/tmp/bing-data-${Date.now()}.json`;
    const fs = require('fs');
    fs.writeFileSync(tempFile, JSON.stringify(result));

    // Upload to KV
    await execAsync(
      `npx wrangler kv:put --binding=${KV_NAMESPACE} ${KV_KEY} @${tempFile}`
    );

    // Clean up
    fs.unlinkSync(tempFile);

    console.log('KV updated successfully!');
  } catch (error) {
    console.error('Error updating KV:', error);
  }
}

updateKV();
