
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrls: string[];
  videoUrls: string[];
  isPublished: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://colorhutbd.xyz/firestore/api/index.php';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '308e36cdaec0e79ef79f5a30db49d9df8e71fc8e05b859988f52a4b4c97b1858';
const COLLECTION_NAME = 'products';

if (!API_URL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL environment variable.');
}
if (!API_KEY) {
  console.warn('Missing NEXT_PUBLIC_API_KEY environment variable. API calls may fail.');
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY || '',
};

// Helper to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
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
    videoUrls: doc.data.videoUrls || [],
    isPublished: doc.data.isPublished === undefined ? true : doc.data.isPublished,
    createdAt: doc.data.createdAt || new Date().toISOString(),
  };
}

// Fetch all products
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/collections/${COLLECTION_NAME}/documents`, { headers });
  const result = await handleResponse(response);
  if (!Array.isArray(result)) {
    throw new Error("Invalid data format received from API.");
  }
  return result.map(mapDocToProduct);
}

// Create a new product
export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const payload = {
    data: { ...productData, createdAt: new Date().toISOString() },
  };
  const response = await fetch(`${API_URL}/collections/${COLLECTION_NAME}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const result = await handleResponse(response);
  return mapDocToProduct(result);
}

// Update an existing product
export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
  const payload = {
    data: productData,
  };
  const response = await fetch(`${API_URL}/collections/${COLLECTION_NAME}/documents/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const result = await handleResponse(response);
  return mapDocToProduct(result);
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/collections/${COLLECTION_NAME}/documents/${id}`, {
    method: 'DELETE',
    headers,
  });
  // DELETE might return 204 No Content, which is ok.
  if (!response.ok && response.status !== 204) {
    await handleResponse(response);
  }
}
