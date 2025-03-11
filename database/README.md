## Database

The **database** directory holds JSON files with sample data for Firestore collections. You can use these files with an import script (such as `importData.js`) to quickly populate your Firestore database with initial data.  
The JSON files include data for the following collections:

- **users**: User accounts and related details.
- **products**: Information about products available in the shop.
- **user_product**: (Optional) Relationships between users and products (e.g., favorites).
- **purchases**: Purchase records including product details, quantities, and order metadata.
- **shipping_details**: Shipping information for orders.
- **invoice_details**: Invoice data used during checkout and order processing.
- **payment_details**: Payment information for orders.
- **newsletter**: Sample newsletter subscriptions.
- **contact_messages**: Messages submitted through the contact form.

This structure allows for a quick and easy way to test and demo the application by importing data directly into Firestore.
