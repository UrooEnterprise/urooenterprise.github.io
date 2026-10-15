async function loadStoreProducts() {
    try {
        // Fetch the CSV file directly from your GitHub repository
        const response = await window.fetch('products.csv');
        const csvText = await response.text();
        
        // Parse CSV data into rows
        const rows = csvText.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        const headers = rows[0].split(',');
        
        const productContainer = document.getElementById('product-grid'); // Make sure you have a <div id="product-grid"></div> in your HTML
        productContainer.innerHTML = ''; // Clear previous content

        // Loop through each product row (skipping the header row)
        for (let i = 1; i < rows.length; i++) {
            // Simple CSV line parser handling commas
            const values = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rows[i].split(',');
            const product = {};
            
            headers.forEach((header, index) => {
                let val = values[index] ? values[index].trim() : '';
                // Remove surrounding quotes if present
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                product[header.trim()] = val;
            });

            const isOutStock = product.stock && product.stock.toLowerCase().includes('out');

            // Build the product card HTML dynamically
            const cardHTML = `
                <div class="product-card" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 10px; background: #fff; position: relative;">
                    ${isOutStock ? '<span style="position: absolute; top: 10px; right: 10px; background: #ff4d4d; color: #fff; padding: 4px 8px; font-size: 12px; border-radius: 4px;">Out of Stock</span>' : ''}
                    
                    <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px;">
                    <span style="font-size: 12px; color: #666; text-transform: uppercase;">${product.category}</span>
                    <h3 style="font-size: 16px; margin: 8px 0;">${product.title}</h3>
                    <p style="font-size: 14px; color: #444; margin-bottom: 12px;">${product.description}</p>
                    
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px;">
                        <span style="font-size: 18px; font-weight: bold; color: #2e7d32;">₹${product.price}</span>
                        <span style="font-size: 14px; color: #888; text-decoration: line-through;">₹${product.mrp}</span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        ${isOutStock ? 
                            `<button disabled style="flex: 1; padding: 10px; background: #cccccc; color: #666; border: none; border-radius: 4px; cursor: not-allowed;">Sold Out</button>` :
                            `<button onclick="openCheckout('${product.sku}', '${product.title}',${product.price}, '${product.hsn}', '${product.gst}')" style="flex: 1; padding: 10px; background: #1976d2; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Buy Direct (UPI)</button>`
                        }
                    </div>
                    
                    <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px;">
                        <a href="${product.amazon}" target="_blank" style="color: #ff9900; text-decoration: none;">View on Amazon</a>
                        <a href="${product.meesho}" target="_blank" style="color: #d81b60; text-decoration: none;">View on Meesho</a>
                    </div>
                </div>
            `;
            
            productContainer.innerHTML += cardHTML;
        }
    } catch (error) {
        console.error("Error loading products catalog:", error);
    }
}

// Run the function when the page loads
window.addEventListener('DOMContentLoaded', loadStoreProducts);