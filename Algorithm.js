function rentContainers(neededContainer, listings) {
    listings.sort((a, b) => (a.totalCost / a.container) - (b.totalCost / b.container));

    let totalCost = 0;


    listings.forEach((listing) => {
        if (neededContainer > 0) {
            let containerToRent = Math.min(neededContainer, listing.container);
            neededContainer -= containerToRent;
            totalCost += containerToRent * (listing.totalCost / listing.container);
            console.log(`[Constract with] ${listing.name} ${containerToRent} container, price: ${listing.totalCost}`)
        }
    });

    if (neededContainer > 0) {
        console.log("Not enough containers");
    }
    console.log(`[Summary] total cost ${totalCost}`)
    
}

// const neededContainer = 3;
//             const listings = [
//               {
//                 name: "Container renter A",
//                 container: 1,
//                 totalCost: 1,
//               },
//               {
//                 name: "Container renter B",
//                 container: 2,
//                 totalCost: 1,
//               },
//               {
//                 name: "Container renter C",
//                 container: 3,
//                 totalCost: 3,
//               },
//             ];

// rentContainers(neededContainer, listings);