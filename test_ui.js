const inventory = [
  { resource_id: 1, resource_name: 'Plastic Chairs', resource_type: 'Furniture', status: 'Available', available_quantity: 30, total_quantity: 500 }
];
const allocations = [];
const formData = { category: 'Furniture' };

const categories = [...new Set(inventory.filter(r => r.status === 'Available' && r.available_quantity > 0).map(r => r.resource_type))];
console.log("Categories:", categories);

const resources = inventory.filter(r => r.status === 'Available' && r.available_quantity > 0 && r.resource_type === formData.category && !allocations.some(a => a.resource_id === r.resource_id));
console.log("Resources:", resources);
