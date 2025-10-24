/**
 * IPFS Service using Pinata API
 * Simple, lightweight implementation using fetch()
 */

export class IPFSService {
  private jwt: string;
  private gatewayUrl: string = 'https://gateway.pinata.cloud/ipfs/';

  constructor() {
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT || '';
    if (!this.jwt) {
      console.warn(' No Pinata JWT found - uploads will use mock storage');
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   */
  async uploadJSON(data: any): Promise<string> {
    try {
      if (!this.jwt) {
        console.warn('No Pinata JWT - using mock storage');
        return this.mockUpload(data);
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.jwt}`
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: { name: `movie-metadata-${Date.now()}` }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();
      const cid = result.IpfsHash;
      console.log(' Uploaded JSON to IPFS:', cid);
      return `ipfs://${cid}`;
    } catch (error) {
      console.error(' Pinata upload error:', error);
      return this.mockUpload(data);
    }
  }

  /**
   * Upload file (image, poster, etc.) to IPFS
   */
  async uploadFile(file: File): Promise<string> {
    try {
      if (!this.jwt) {
        console.warn('No Pinata JWT - using mock storage');
        return this.mockUploadFile(file);
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = JSON.stringify({
        name: file.name,
      });
      formData.append('pinataMetadata', metadata);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();
      const cid = result.IpfsHash;
      console.log(' Uploaded file to IPFS:', cid);
      return cid;  // Return just the CID, not ipfs:// prefix
    } catch (error) {
      console.error(' File upload failed:', error);
      return this.mockUploadFile(file);
    }
  }

  /**
   * Retrieve JSON from IPFS
   */
  async getJSON(hashOrUri: string): Promise<any> {
    try {
      // If full URL, fetch as-is
      if (hashOrUri.startsWith('http://') || hashOrUri.startsWith('https://')) {
        const res = await fetch(hashOrUri);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }
      // Remove ipfs:// prefix if present, fetch via gateway
      const hash = hashOrUri.replace('ipfs://', '');
      const response = await fetch(`${this.gatewayUrl}${hash}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(' IPFS fetch error:', error);
      return this.mockGet(hashOrUri);
    }
  }

  /**
   * Get gateway URL for IPFS content
   */
  gatewayURL(ipfsURI: string): string {
    if (!ipfsURI) return '';
    if (ipfsURI.startsWith('http://') || ipfsURI.startsWith('https://')) {
      return ipfsURI;
    }
    const hash = ipfsURI.replace('ipfs://', '');
    return `${this.gatewayUrl}${hash}`;
  }

  // Mock storage for development without Pinata
  private mockUpload(data: any): string {
    const mockCID = 'Qm' + Math.random().toString(36).substring(2, 15);
    const mockURI = `ipfs://${mockCID}`;
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('ipfs-data') || '{}');
      stored[mockCID] = data;
      localStorage.setItem('ipfs-data', JSON.stringify(stored));
      console.log(' Mock IPFS storage:', mockURI);
    }
    return mockURI;
  }

  private mockUploadFile(file: File): string {
    const mockCID = 'Qm' + Math.random().toString(36).substring(2, 15);
    if (typeof window !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const stored = JSON.parse(localStorage.getItem('ipfs-files') || '{}');
        stored[mockCID] = {
          name: file.name,
          type: file.type,
          data: e.target?.result
        };
        localStorage.setItem('ipfs-files', JSON.stringify(stored));
      };
      reader.readAsDataURL(file);
      console.log(' Mock IPFS file storage:', mockCID);
    }
    return mockCID;  // Return just CID for mock
  }

  private mockGet(hashOrUri: string): any {
    const hash = hashOrUri.replace('ipfs://', '');
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('ipfs-data') || '{}');
      return stored[hash] || null;
    }
    return null;
  }
}

export const ipfsService = new IPFSService();
