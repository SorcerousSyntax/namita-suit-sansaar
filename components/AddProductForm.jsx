'use client';

import { useState } from 'react';

export default function AddProductForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState([]);
  const [colorsText, setColorsText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.length) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      files.forEach((file) => uploadData.append('images', file));

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        alert(uploadJson.error || 'Image upload failed');
        setLoading(false);
        return;
      }

      const images = Array.isArray(uploadJson.urls)
        ? uploadJson.urls
        : uploadJson.url
          ? [uploadJson.url]
          : [];

      if (!images.length) {
        alert('No image URLs returned from server');
        setLoading(false);
        return;
      }

      const colors = (colorsText || '')
        .split(',')
        .map((color) => color.trim())
        .filter(Boolean);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price,
          stock,
          category,
          images,
          colors,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Product added successfully');

        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setStock('');
        setCategory('');
        setFiles([]);
        setColorsText('');
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className="border p-2 w-full"
      />

      <input
        type="text"
        placeholder="Available Colors (comma separated)"
        value={colorsText}
        onChange={(e) => setColorsText(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? 'Uploading...' : 'Add Product'}
      </button>
    </form>
  );
}
