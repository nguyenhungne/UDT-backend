//solutions for algorithm test
// 1. Sort the listings by totalCost/container smallest to largest
// 2. Loop through the listings and rent the smallest container first
// 3. If the neededContainer is less than 0, break the loop (optimal solution)
// 4. If the neededContainer is greater than 0, display "Not enough containers"
// 5. Display the total cost

function rentContainers(neededContainer, listings) {
    listings.sort((a, b) => (a.totalCost / a.container) - (b.totalCost / b.container));

    let totalCost = 0;

    for (let listing of listings) {
        if (neededContainer <= 0) break;
        let containerToRent = Math.min(neededContainer, listing.container);
        neededContainer -= containerToRent;
        totalCost += containerToRent * (listing.totalCost / listing.container);
        console.log(`[Contract with] ${listing.name} ${containerToRent} container, price: ${listing.totalCost}`)
    }

    if (neededContainer > 0) {
        console.log("Not enough containers");
    }
    console.log(`[Summary] total cost ${totalCost}`);
}

const neededContainer = 10;
const listings = [
    {
      name: "Container renter A",
      container: 5,
      totalCost: 5,
    },
    {
      name: "Container renter B",
      container: 2,
      totalCost: 10,
    },
    {
      name: "Container renter C",
      container: 10,
      totalCost: 3,
    },
  ];           

rentContainers(neededContainer, listings);