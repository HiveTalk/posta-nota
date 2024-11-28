// Live Event Generator for Nostr
class NostrLiveEvent {
    constructor(privateKey = null) {
      this.KIND = 30311; // NIP-96 Live Event kind
    }
  
    // Generate a random identifier for the event
    generateIdentifier(length = 10) {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }
  
    // Create a live event
    createLiveEvent({
      pubkey,
     // relays,
      title,
      summary = '',
      startTime, //  = Math.floor(Date.now() / 1000) + 3600, // Default to 1 hour from now
      endTime,
      streamUrl,
      image = '',
      tags = [],
      status = 'planned' // planned, live, ended
    }) {
      // Generate a unique identifier for this event
      const identifier = this.generateIdentifier();
  
      // Construct the content object
      const content = JSON.stringify({
        title,
        summary,
        streaming: {
          url: streamUrl,
        },
        image,
        starts: startTime,
        status,
      });
  
      // Construct the event object
      const event = {
        kind: this.KIND,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          // ['relays', relays.toString()],
          ['d', identifier],
          ['title', title],
          ['starts', startTime.toString()],
          ['ends', endTime.toString()],
          ['streaming', streamUrl],
          ['summary', summary],
          ...tags
        ],
        content
      };
  
      return {
        event,
        identifier
      };
    }
  
    // Generate naddr for the event
    generateNaddr(pubkey, identifier, relays = []) {
      // TLV (Type-Length-Value) encoding functions
      const hexToBytes = (hex) => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return bytes;
      };
  
      const stringToBytes = (str) => new TextEncoder().encode(str);
  
      // Create TLV data
      const special = new Uint8Array([
        0, // Special type
        32, // Length (32 bytes for pubkey)
        ...hexToBytes(pubkey),
        1, // Relay type
        relays.join(',').length, // Length of concatenated relays
        ...stringToBytes(relays.join(',')),
        2, // Identifier type
        identifier.length, // Length of identifier
        ...stringToBytes(identifier),
        3, // Kind type
        2, // Length (2 bytes for kind)
        (this.KIND >> 8) & 0xff, // High byte
        this.KIND & 0xff // Low byte
      ]);
  
      // Base32 encoding
      const base32Chars = 'abcdefghijklmnopqrstuvwxyz234567';
      let bits = 0;
      let value = 0;
      let output = '';
  
      for (let i = 0; i < special.length; i++) {
        value = (value << 8) | special[i];
        bits += 8;
        
        while (bits >= 5) {
          output += base32Chars[(value >> (bits - 5)) & 31];
          bits -= 5;
        }
      }
  
      if (bits > 0) {
        output += base32Chars[(value << (5 - bits)) & 31];
      }
  
      return `naddr${output}`;
    }
}

  