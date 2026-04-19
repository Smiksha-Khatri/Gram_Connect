import axios from 'axios';
import { API } from '../App';

export const uploadToCloudinary = async (file, folder = 'products', token) => {
  try {
    const sigResponse = await axios.get(`/cloudinary/signature?folder=${folder}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { signature, timestamp, cloud_name, api_key } = sigResponse.data;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
