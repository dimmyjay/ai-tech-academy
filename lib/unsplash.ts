// lib/unsplash.ts
import { createApi } from 'unsplash-js';

// Initialize Unsplash API client
const unsplashApi = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

// Type definitions for Unsplash responses
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  user: {
    name: string;
    username: string;
    portfolio_url?: string;
  };
  links: {
    self: string;
    html: string;
    download?: string;
  };
}

export interface UnsplashSearchResults {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

// Tech-related search queries for course thumbnails
const techCategories = {
  'Web Development': ['coding', 'programming', 'web development', 'javascript', 'react'],
  'Mobile Development': ['mobile app', 'smartphone', 'ios', 'android', 'flutter'],
  'Data Science': ['data science', 'artificial intelligence', 'machine learning', 'analytics', 'big data'],
  'Cybersecurity': ['cybersecurity', 'hacking', 'security', 'encryption', 'network'],
  'Cloud Computing': ['cloud computing', 'aws', 'server', 'devops', 'kubernetes'],
  'UI/UX Design': ['ui design', 'ux design', 'figma', 'design', 'interface'],
  'Blockchain': ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'web3'],
  'Game Development': ['game development', 'gaming', 'unity', 'unreal engine', '3d'],
  'Digital Marketing': ['digital marketing', 'seo', 'social media', 'content marketing'],
  'Product Management': ['product management', 'agile', 'scrum', 'startup', 'business']
};

/**
 * Search for images related to a specific tech topic
 */
export async function searchTechImages(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<UnsplashSearchResults> {
  try {
    // ✅ FIX: Cast to any to bypass strict unsplash-js version type mismatches
    const result = await (unsplashApi as any).search.getPhotos({
      query,
      page,
      perPage,
      orientation: 'landscape', // Better for course thumbnails
    });

    if (result.type === 'success') {
      return {
        total: result.response.total,
        total_pages: result.response.total_pages,
        results: result.response.results.map(mapUnsplashImage),
      };
    }

    throw new Error(result.errors?.[0] || 'Failed to search images');
  } catch (error) {
    console.error('Unsplash search error:', error);
    throw error;
  }
}

/**
 * Get random tech images for course thumbnails
 */
export async function getRandomTechImages(
  category: string,
  count: number = 5
): Promise<UnsplashImage[]> {
  try {
    // Get relevant keywords for the category
    const keywords = techCategories[category as keyof typeof techCategories] || ['technology', 'coding'];
    
    // Pick a random keyword
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    // ✅ FIX: Cast to any to bypass strict unsplash-js version type mismatches
    const result = await (unsplashApi as any).search.getPhotos({
      query: randomKeyword,
      page: 1,
      perPage: count,
      orientation: 'landscape',
    });

    if (result.type === 'success') {
      return result.response.results.map(mapUnsplashImage);
    }

    throw new Error(result.errors?.[0] || 'Failed to get random images');
  } catch (error) {
    console.error('Unsplash random images error:', error);
    // Fallback to default tech images
    return getDefaultTechImages(count);
  }
}

/**
 * Get a single random image for a course
 */
export async function getCourseThumbnail(category: string): Promise<string> {
  try {
    const images = await getRandomTechImages(category, 1);
    return images[0]?.urls.regular || getDefaultImage();
  } catch (error) {
    console.error('Failed to get course thumbnail:', error);
    return getDefaultImage();
  }
}

/**
 * Get multiple images for different courses
 */
export async function getMultipleCourseThumbnails(
  categories: string[]
): Promise<Record<string, string>> {
  const thumbnails: Record<string, string> = {};

  await Promise.all(
    categories.map(async (category) => {
      try {
        const url = await getCourseThumbnail(category);
        thumbnails[category] = url;
      } catch (error) {
        console.error(`Failed to get thumbnail for ${category}:`, error);
        thumbnails[category] = getDefaultImage();
      }
    })
  );

  return thumbnails;
}

/**
 * Get image by ID
 */
export async function getImageById(id: string): Promise<UnsplashImage | null> {
  try {
    // ✅ FIX: Cast to any to bypass strict unsplash-js version type mismatches
    const result = await (unsplashApi as any).photos.get({
      photoId: id,
    });

    if (result.type === 'success') {
      return mapUnsplashImage(result.response);
    }

    return null;
  } catch (error) {
    console.error('Unsplash get image error:', error);
    return null;
  }
}

/**
 * Download/track an image (required by Unsplash API guidelines)
 */
export async function trackImageDownload(link: string): Promise<void> {
  try {
    // ✅ FIX: Cast to any to bypass strict unsplash-js version type mismatches
    await (unsplashApi as any).photos.trackDownload({
      downloadLocation: link,
    });
  } catch (error) {
    console.error('Failed to track image download:', error);
  }
}

/**
 * Helper function to map Unsplash API response to our type
 */
function mapUnsplashImage(response: any): UnsplashImage {
  return {
    id: response.id,
    urls: {
      raw: response.urls.raw,
      full: response.urls.full,
      regular: response.urls.regular,
      small: response.urls.small,
      thumb: response.urls.thumb,
    },
    width: response.width,
    height: response.height,
    description: response.description,
    alt_description: response.alt_description,
    user: {
      name: response.user.name,
      username: response.user.username,
      portfolio_url: response.user.links?.html,
    },
    links: {
      self: response.links.self,
      html: response.links.html,
      download: response.links.download_location,
    },
  };
}

/**
 * Get default fallback images
 */
function getDefaultTechImages(count: number): UnsplashImage[] {
  const defaultImages = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop', // Coding
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop', // Programming
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop', // Tech
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop', // Developer
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop', // Code
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `default-${i}`,
    urls: {
      raw: defaultImages[i % defaultImages.length],
      full: defaultImages[i % defaultImages.length],
      regular: defaultImages[i % defaultImages.length],
      small: defaultImages[i % defaultImages.length],
      thumb: defaultImages[i % defaultImages.length],
    },
    width: 800,
    height: 600,
    description: 'Default tech image',
    alt_description: 'Technology',
    user: {
      name: 'Unsplash',
      username: 'unsplash',
    },
    links: {
      self: '',
      html: '',
    },
  }));
}

function getDefaultImage(): string {
  return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop';
}

export default unsplashApi;
