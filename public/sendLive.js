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
                      // Swal.fire({
                      //     position: 'center',
                      //     icon: 'success',
                      //     title: 'Note Sent',
                      //     html: `<p>Sent to Nostr successfully!</p> <p>Note: <a href="https://snort.social/e/${eventID}" target="_blank">${eventID}</a></p>`,
                      // });
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
