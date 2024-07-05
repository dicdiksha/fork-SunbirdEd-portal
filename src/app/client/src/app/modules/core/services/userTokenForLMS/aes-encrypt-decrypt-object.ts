import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {

    constructor() { }

    // Function to convert a UTF-8 string to an ArrayBuffer
    private stringToArrayBuffer(str: string): ArrayBuffer {
        return new TextEncoder().encode(str);
    }

    // Function to convert an ArrayBuffer to a base64 string
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    // Function to convert a base64 string to an ArrayBuffer
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Function to generate a crypto key
    async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
      * this is common method to encrypt any object/json object using AES-GCM method
     */

    // Function to encrypt data
    async encryptData(data: any, key: CryptoKey): Promise<any> {
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate random IV
        const encodedData = this.stringToArrayBuffer(JSON.stringify(data));
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encodedData
        );

        // Convert the ArrayBuffer to a Uint8Array
        const encryptedArray = new Uint8Array(encryptedData);

        // Extract the ciphertext and the authentication tag
        const cipherText = encryptedArray.slice(0, encryptedArray.length - 16);
        const authTag = encryptedArray.slice(encryptedArray.length - 16);

        return {
            iv: this.arrayBufferToBase64(iv),
            data: this.arrayBufferToBase64(cipherText),
            authTag: this.arrayBufferToBase64(authTag),
            key: this.arrayBufferToBase64(await crypto.subtle.exportKey('raw', key)) // Export the key for server decryption
        };
    }
}
