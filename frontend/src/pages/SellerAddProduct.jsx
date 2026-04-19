import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useAuth } from '../App';
import { uploadToCloudinary } from '../utils/cloudinary';
import { Upload, Loader, X } from 'lucide-react';
import { toast } from 'sonner';

const SellerAddProduct = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Spices',
    price: '',
    quantity: '',
    unit: 'kg',
    images: [],
    organic_certified: false,
    certification_image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file, 'products', token);
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      await axios.post('/products', productData);
      toast.success('Product added successfully!');
      navigate('/seller/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8" data-testid="add-product-title">
            Add New Product
          </h1>

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                required
                data-testid="product-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full h-32"
                required
                data-testid="product-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                  data-testid="product-category-select"
                >
                  <option value="Spices">Spices</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Handmade">Handmade</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-field w-full"
                  data-testid="product-unit-select"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="L">Liter (L)</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="product-price-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field w-full"
                  required
                  data-testid="product-quantity-input"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.organic_certified}
                  onChange={(e) => setFormData({ ...formData, organic_certified: e.target.checked })}
                  className="w-4 h-4 text-[#81B29A] border-gray-300 rounded focus:ring-[#81B29A]"
                  data-testid="organic-certified-checkbox"
                />
                <span className="text-sm font-medium text-[#3D405B]">Organic Certified</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D405B] mb-2">Product Images *</label>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="btn-outline cursor-pointer inline-flex items-center" data-testid="upload-product-image">
                {uploading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary w-full disabled:opacity-50"
              data-testid="submit-product-button"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerAddProduct;
