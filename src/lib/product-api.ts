
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrls: string[];
  videoUrl: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  isPublished: boolean;
  imageFiles?: FileList;
  existingImageUrls?: string[];
  videoUrl: string;
}


const UPLOAD_API_URL = 'https://colorhutbd.xyz/products/image.php';
const FIRESTORE_API_URL = 'https://colorhutbd.xyz/firestore/api/index.php';
const API_KEY = '308e36cdaec0e79ef79f5a30db49d9df8e71fc8e05b859988f52a4b4c97b1858';
const COLLECTION_NAME = 'products';

const firestoreHeaders = {
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY,
};

// Helper to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 404 && response.url.includes(`/collections/${COLLECTION_NAME}/documents`)) {
      return { documents: [] };
    }
    const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// Map API document to our Product interface
function mapDocToProduct(doc: any): Product {
  return {
    id: doc.id,
    name: doc.data.name || 'Unnamed Product',
    description: doc.data.description || '',
    category: doc.data.category || 'Uncategorized',
    imageUrls: doc.data.imageUrls || [],
    videoUrl: doc.data.videoUrl || '',
    isPublished: doc.data.isPublished === undefined ? true : doc.data.isPublished,
    createdAt: doc.data.createdAt || new Date().toISOString(),
  };
}

// Upload images and get their URLs
async function uploadImages(files: FileList): Promise<string[]> {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files[]', file);
  });

  const response = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    const errorDetails = result.errors?.[0]?.message || 'Image upload failed.';
    throw new Error(errorDetails);
  }
  
  return result.uploaded_files.map((file: any) => file.file_url);
}

// Fetch all products
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${FIRESTORE_API_URL}/collections/${COLLECTION_NAME}/documents`, { headers: firestoreHeaders });
  const result = await handleResponse(response);
  const documents = result?.documents;
  
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents.map(mapDocToProduct);
}

// Fetch a single product by ID
export async function getProduct(id: string): Promise<Product> {
    const response = await fetch(`${FIRESTORE_API_URL}/collections/${COLLECTION_NAME}/documents/${id}`, { headers: firestoreHeaders });
    const result = await handleResponse(response);
    return mapDocToProduct(result);
}

// Create a new product
export async function createProduct(productData: ProductFormData): Promise<Product> {
  let newImageUrls: string[] = [];
  if (productData.imageFiles && productData.imageFiles.length > 0) {
    newImageUrls = await uploadImages(productData.imageFiles);
  }

  const payload = {
    data: { 
      name: productData.name,
      description: productData.description,
      category: productData.category,
      isPublished: productData.isPublished,
      videoUrl: productData.videoUrl,
      imageUrls: newImageUrls,
      createdAt: new Date().toISOString() 
    },
  };

  const response = await fetch(`${FIRESTORE_API_URL}/collections/${COLLECTION_NAME}/documents`, {
    method: 'POST',
    headers: firestoreHeaders,
    body: JSON.stringify(payload),
  });

  const result = await handleResponse(response);
  return mapDocToProduct(result);
}

// Update an existing product
export async function updateProduct(id: string, productData: ProductFormData): Promise<Product> {
  let newImageUrls: string[] = [];
  if (productData.imageFiles && productData.imageFiles.length > 0) {
    newImageUrls = await uploadImages(productData.imageFiles);
  }
  
  const finalImageUrls = [...(productData.existingImageUrls || []), ...newImageUrls];

  // First, get the existing product to preserve the createdAt field
  const existingProduct = await getProduct(id);

  const payload = {
    data: {
      name: productData.name,
      description: productData.description,
      category: productData.category,
      isPublished: productData.isPublished,
      videoUrl: productData.videoUrl,
      imageUrls: finalImageUrls,
      createdAt: existingProduct.createdAt, // Preserve original creation date
    },
  };

  const response = await fetch(`${FIRESTORE_API_URL}/collections/${COLLECTION_NAME}/documents/${id}`, {
    method: 'PUT',
    headers: firestoreHeaders,
    body: JSON.stringify(payload),
  });
  const result = await handleResponse(response);
  return mapDocToProduct(result);
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${FIRESTORE_API_URL}/collections/${COLLECTION_NAME}/documents/${id}`, {
    method: 'DELETE',
    headers: firestoreHeaders,
  });
  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
}
