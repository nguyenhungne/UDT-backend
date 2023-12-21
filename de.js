// SECTION I: Algorithm.
//     1. A logistic company plan to rent a large amount of empty container.
//       + Your task is to design an algorithm to help logistic company able to rent enough containers at the lowest price.
//       + Case 1: 
//         - Input: 
//             const neededContainer = 3;
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
//         - Output: 
//             [Contract with] Container renter B 2 container, price: 1
//             [Contract with] Container renter A 1 container, price: 1
//             [Summary] total cost 2
//         - Explain: The optimal price is to rent 1 container from renter A and 2 containers from renter B, the total cost of them is 2. (Same total cost but different provider is accepted)

//       + Case 2:
//           - Input: 
//               const neededContainer = 10;
//               const listings = [
//                 {
//                   name: "Container renter A",
//                   container: 5,
//                   totalCost: 5,
//                 },
//                 {
//                   name: "Container renter B",
//                   container: 2,
//                   totalCost: 10,
//                 },
//                 {
//                   name: "Container renter C",
//                   container: 2,
//                   totalCost: 3,
//                 },
//               ];
//           - Output:
//               [Contract with] Container renter A 5 container, price: 5
//               [Contract with] Container renter C 2 container, price: 3
//               [Contract with] Container renter B 2 container, price: 10
//               Not enough containers
//               [Summary] total cost 18
//           - Explain: Display "not enough containers" if don't have enough container providers.
//       + Case 3:
//           - Input:
//               const neededContainer = 10;
//               const listings = [
//                 {
//                   name: "Container renter A",
//                   container: 5,
//                   totalCost: 5,
//                 },
//                 {
//                   name: "Container renter B",
//                   container: 2,
//                   totalCost: 10,
//                 },
//                 {
//                   name: "Container renter C",
//                   container: 10,
//                   totalCost: 3,
//                 },
//               ];
//           - Output:
//               [Contract with] Container renter C 10 container, price: 3
//               [Summary] total cost 3




// CASE STUDY: We are planning to build a backend for an e-commercial platform, your task is doing from system design, implementation to deploy production.
//     SECTION I:
//       1. Design UML for the backend of these features based on best practices to ensure scalable, easy coding.
//         + Customer:
//           - Can storage personal information (name, address, email, phone number, gender, etc...), cart, transaction, billing.
//         + Agency:
//           - Can storage personal information (name, address, email, phone number, gender, etc...), product, transaction, billing.
//         + Admin:
//           - Can read/create/update/delete agency.

//     SECTION II:
//       1. With UML you have already designed on question 1, what database are you using to implement?
//       --> mongodb   
//       2. Why are you using that? What is the strong and weak point of it?
//       Strengths:
//       - Flexible data model:
//          + MongoDB is a NoSQL database, meaning it doesn't require a fixed schema like SQL databases. This allows you to store data in the way you want, and change the data structure without having to overhaul the entire database.   
//       - High performance:
//          + MongoDB provides high query performance, especially for complex queries.
//       - Scalability:
//          + MongoDB is great for working with large data as it supports sharding, allowing you to distribute data across multiple servers.  
//       3. Write docker-compose.yml to start the database locally.
//       4. Setup Loopback 4
//       5. Using UML on question 1, set up API for these features.

//     SECTION II:
//       1. Write sequence diagram to build a solution for authentication and authorize adapt the list of features below.
//         + Customer:
//           - Can login, logout.
//           - Read transaction, billing linked with product.
//           - Read agency information.
//         + Agency:
//           - Agency can read/create/update/delete of owner product.
//           - Agency can read transaction, billing of owner.
//         + Admin: 
//           - Read billing, transaction linked product, customer, agency.
//         + Common:
//           - User can store auth state after reopen browser.
//       2. Using solution on question 1, implements loopback4 for these features.
//       3. What's the strong and weak point of your solution? How to improve that?
//       Strengths:
//          Strengths:
//          - Easy to use:
//            + Admin use AdminController to manage all the data of the system.
//            + Customer use CustomerController to manage all the data of the system.
//            + Agency use AgencyController to manage all the data of the system.
//          Weak:
//       - Easy to use:
//        Weak:
//       4. Write sequence diagram to build a solution for testing, ensure correct permission scalable from 100 APIs to 1000 APIs.
//       - Sign up admin, customer, agency
//       - Login admin, customer, agency
//       - Create, Read, Update, Delete with api each controller admin, customer, agency
//       - Logout admin, customer, agency

//     SECTION III: Good job, right now our application needs to synchronize products, pricing of the Agency by using third-party API. 
//       1. Write sequence diagram to build a solution to save, merge products data from third-party API to our database. (Third-party API data change every hour)
//       2. What's the strong and weak point of your solution? How to improve that?
//     SECTION IV:
//       1. Write an architecture diagram to build a solution adapt the list of features below.
//         + Ensure isolating development and production data. (Don't merge data together)
//         + Apply Gitlab CI or Github Action to test, build and deploy to Heroku automatically.