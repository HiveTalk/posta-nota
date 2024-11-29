async function sendLiveEvent(event, publicKey, defaultRelays) {
    try {
       // let hiveRelays = ['wss://hivetalk.nostr1.com'];
        let allrelays =[ ...defaultRelays]
        console.log('send Live Event', event)
        console.log('send Event - Relays:', allrelays);

        // Request the nos2x extension to sign the event
        const signedEvent = await window.nostr.signEvent(event);
        console.log('Signed Event:', signedEvent);

        const eventID = signedEvent['id'];
        console.log('Event ID', eventID);
        console.log("all relays", allrelays);

        const pool = new window.NostrTools.SimplePool();
        await Promise.any(pool.publish(allrelays, signedEvent));
        console.log('Published to at least one relay!');

        const h = pool.subscribeMany(
            [...allrelays],
            [
                {
                    authors: [publicKey],
                },
            ],
            {
              onevent(event) {
                  if (event.id === eventID) {
                      console.log('Live Activity Event received:', event);
                      Swal.fire({
                          position: 'center',
                          icon: 'success',
                          title: 'Live Activity Sent to Nostr Relays',
                          html: `<p>Sent to Nostr successfully!</p> <p>Note: <a href="https://snort.social/e/${eventID}" target="_blank">${eventID}</a></p>`,
                      });
                  }
              },
              oneose() {
                  h.close();
              },
            },
        );
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function setupLiveEvent() {
    const relays = ['wss://testnet.plebnet.dev/nostrrelay/2hive']
    const start_time = Math.floor(Date.now() / 1000) + 7200 // Start in 2 hours
    const end_time = start_time  + 36000;
    const status = 'planned'; // planned, live, ended

    const eventParams = {
        pubkey: pubkey,
        startTime: start_time,
        endTime: end_time,
        title:  'My First Live Stream',
        summary: 'Join me for an amazing live stream about Nostr!',
        streamUrl: 'https://hivetalk.org/join/roomname',
        image: 'https://example.com/thumbnail.jpg',
        tags: [
          ['t', 'nostr'],
          ['t', 'hivetalk'],
          ['t', 'livestream'],
          ['status', status],
        ]
      }
      console.log('eventParams', eventParams)
      const generator = new NostrLiveEvent();
      const { event, identifier } = generator.createLiveEvent(eventParams);
      const naddr = generator.generateNaddr(pubkey, identifier, relays);
      console.log('Live Event:', event);
      console.log('Naddr:', naddr);
      console.log('Relays:', relays);
      sendLiveEvent(event, pubkey, relays);
}
