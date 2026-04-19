import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useAuth } from '../App';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';

const SellerStoreSetup = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    store_url: '',
    village_name: '',
    state: '',
    farming_practices: '',
    family_background: '',
    story: '',
    profile_image: '',
    farm_images: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExistingStore();
  }, []);

  const fetchExistingStore = async () => {
    try {
      const response = await axios.get('/seller/my-store');
      setFormData(response.data);
    } catch (error) {
      console.log('No existing store');
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, 'stores', token);
      if (field === 'profile_image') {
        setFormData({ ...formData, profile_image: imageUrl });
      }
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/seller/store', formData);
      toast.success('Store setup complete!');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Failed to save store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-2" data-testid="store-setup-title">
            Setup Your Store
          </h1>
          <p className="text-[#5F637A] mb-8">Tell customers about your farm and story</p>

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Store URL *</label>
              <div className="flex items-center">
                <span className="text-[#8D91A8] mr-2">gramconnect.com/store/</span>
                <input
                  type="text"
                  value={formData.store_url}
                  onChange={(e) => setFormData({ ...formData, store_url: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="input-field flex-1"
                  placeholder="your-farm-name"
                  required
                  data-testid="store-url-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">Village Name *</label>
                <input
                  type="text"
                  value={formData.village_name}
                  onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="village-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="state-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Your Story *</label>
              <textarea
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="input-field w-full h-32"
                placeholder="Tell customers about your farming journey..."
                required
                data-testid="story-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Farming Practices *</label>
              <textarea
                value={formData.farming_practices}
                onChange={(e) => setFormData({ ...formData, farming_practices: e.target.value })}
                className="input-field w-full h-24"
                placeholder="Describe your farming methods..."
                required
                data-testid="farming-practices-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Family Background *</label>
              <textarea
                value={formData.family_background}
                onChange={(e) => setFormData({ ...formData, family_background: e.target.value })}
                className="input-field w-full h-24"
                placeholder="Tell about your family's farming heritage..."
                required
                data-testid="family-background-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Profile Image</label>
              {formData.profile_image && (
                <img src={formData.profile_image} alt="Profile" className="w-32 h-32 object-cover rounded-lg mb-4" />
              )}
              <label className="btn-outline cursor-pointer inline-flex items-center" data-testid="upload-profile-image">
                {uploading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'profile_image')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary w-full disabled:opacity-50"
              data-testid="save-store-button"
            >
              {loading ? 'Saving...' : 'Save Store'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerStoreSetup;
