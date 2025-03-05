<template>
  <div class="orders-container">
    <div class="orders-header">
      <h2>Sales Orders</h2>
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search orders..." 
          @input="filterOrders"
        >
      </div>
    </div>

    <div class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th @click="sortBy('orderNumber')">Order #
              <span v-if="sortKey === 'orderNumber'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('orderDate')">Date
              <span v-if="sortKey === 'orderDate'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('shipToName')">Customer
              <span v-if="sortKey === 'shipToName'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('shipToCity')">Location
              <span v-if="sortKey === 'shipToCity'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('sku')">SKU
              <span v-if="sortKey === 'sku'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('quantity')">Qty
              <span v-if="sortKey === 'quantity'" :class="sortDirection"></span>
            </th>
            <th @click="sortBy('requestedWarehouse')">Warehouse
              <span v-if="sortKey === 'requestedWarehouse'" :class="sortDirection"></span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody v-if="displayedOrders.length > 0">
          <tr v-for="order in displayedOrders" :key="order.id">
            <td><strong>{{ order.orderNumber }}</strong></td>
            <td>{{ formatDate(order.orderDate) }}</td>
            <td>{{ order.shipToName }}</td>
            <td>{{ order.shipToCity }}, {{ order.shipToState }}</td>
            <td>{{ order.sku }}</td>
            <td class="text-center">{{ order.quantity }}</td>
            <td>{{ order.requestedWarehouse }}</td>
            <td>
              <button class="btn-view" @click="viewOrderDetail(order)">
                View
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="8" class="no-data">
              <div v-if="loading">Loading orders...</div>
              <div v-else>No orders found</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-if="filteredOrders.length > itemsPerPage">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        class="page-btn"
      >
        Previous
      </button>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        class="page-btn"
      >
        Next
      </button>
    </div>

    <div class="modal" v-if="selectedOrder" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order Details: <span class="order-id">{{ selectedOrder.orderNumber }}</span></h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="order-grid">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Order Number:</div>
                  <div class="info-value">{{ selectedOrder.orderNumber }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Alternate Order Number:</div>
                  <div class="info-value">{{ selectedOrder.alternateOrderNumber || '—' }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Order Date:</div>
                  <div class="info-value">{{ formatDate(selectedOrder.orderDate) }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    <span class="status-badge processing">Processing</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Customer Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Customer Name:</div>
                  <div class="info-value">{{ selectedOrder.shipToName }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Company:</div>
                  <div class="info-value">{{ selectedOrder.shipToCompany || '—' }}</div>
                </div>
                
                <div class="info-item full-width">
                  <div class="info-label">Address:</div>
                  <div class="info-value address">
                    {{ selectedOrder.shipToAddress1 }}<br>
                    <span v-if="selectedOrder.shipToAddress2">{{ selectedOrder.shipToAddress2 }}<br></span>
                    <span v-if="selectedOrder.shipToAddress3">{{ selectedOrder.shipToAddress3 }}<br></span>
                    {{ selectedOrder.shipToCity }}, {{ selectedOrder.shipToState }} {{ selectedOrder.shipToPostalCode }}<br>
                    {{ selectedOrder.shipToCountry }}
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">{{ selectedOrder.shipToPhone || '—' }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Email:</div>
                  <div class="info-value">{{ selectedOrder.shipToEmail || '—' }}</div>
                </div>
              </div>
            </div>
            
            <div class="info-section full-width">
              <h3>Product Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">SKU:</div>
                  <div class="info-value highlight">{{ selectedOrder.sku }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Quantity:</div>
                  <div class="info-value highlight">{{ selectedOrder.quantity }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Warehouse:</div>
                  <div class="info-value">{{ selectedOrder.requestedWarehouse }}</div>
                </div>
              </div>
            </div>
            
            <div class="info-section full-width">
              <h3>Additional Information</h3>
              <div class="info-grid">
                <div class="info-item full-width">
                  <div class="info-label">Delivery Instructions:</div>
                  <div class="info-value">{{ selectedOrder.deliveryInstructions || '—' }}</div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">Tags:</div>
                  <div class="info-value">
                    <template v-if="selectedOrder.tags">
                      <span class="tag" v-for="tag in formatTags(selectedOrder.tags)" :key="tag">{{ tag }}</span>
                    </template>
                    <span v-else>—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrdersList',
  data() {
    return {
      orders: [],
      filteredOrders: [],
      loading: true,
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: '',
      sortKey: 'orderDate',
      sortDirection: 'desc',
      selectedOrder: null
    };
  },
  computed: {
    displayedOrders() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredOrders.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }
  },
  created() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:5275/api/orders');
        this.orders = response.data.data || [];
        this.filteredOrders = [...this.orders];
        this.sortOrders();
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.error = 'Failed to load orders. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },
    formatAddress(order) {
      return `${order.shipToCity}, ${order.shipToState}`;
    },
    formatTags(tags) {
      if (!tags) return [];
      return tags.split(',').map(tag => tag.trim());
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
      this.sortOrders();
    },
    sortOrders() {
      this.filteredOrders.sort((a, b) => {
        let aValue = a[this.sortKey];
        let bValue = b[this.sortKey];
        
        if (this.sortKey === 'orderDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (this.sortKey === 'quantity') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },
    filterOrders() {
      if (!this.searchQuery.trim()) {
        this.filteredOrders = [...this.orders];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredOrders = this.orders.filter(order => 
          order.orderNumber?.toLowerCase().includes(query) ||
          order.shipToName?.toLowerCase().includes(query) ||
          order.shipToCity?.toLowerCase().includes(query) ||
          order.sku?.toLowerCase().includes(query) ||
          order.requestedWarehouse?.toLowerCase().includes(query)
        );
      }
      this.sortOrders();
      this.currentPage = 1;
    },
    viewOrderDetail(order) {
      this.selectedOrder = order;
    },
    closeModal() {
      this.selectedOrder = null;
    }
  }
};
</script>

<style scoped>
.orders-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.orders-header h2 {
  margin: 0;
  color: #3f51b5;
  font-size: 1.5rem;
}

.search-filter input {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-filter input:focus {
  border-color: #3f51b5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.1);
}

.table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #eaeaea;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.orders-table th, 
.orders-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.orders-table th {
  background-color: #f5f7ff;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  color: #3f51b5;
  transition: background-color 0.2s;
}

.orders-table th:hover {
  background-color: #eef0ff;
}

.orders-table tbody tr:hover {
  background-color: #f9faff;
}

.orders-table tbody tr:last-child td {
  border-bottom: none;
}

.asc::after {
  content: " ▲";
  font-size: 12px;
}

.desc::after {
  content: " ▼";
  font-size: 12px;
}

.text-center {
  text-align: center;
}

.btn-view {
  background-color: #3f51b5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-view:hover {
  background-color: #303f9f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.page-btn {
  padding: 8px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 15px;
  font-size: 14px;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 30px !important;
  color: #666;
}

/* Enhanced Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eaeaea;
  background-color: #f8f9fa;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.order-id {
  color: #3f51b5;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0,0,0,0.05);
}

.modal-body {
  padding: 25px;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #eaeaea;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.info-value.highlight {
  font-size: 1.2rem;
  color: #3f51b5;
  font-weight: 600;
}

.info-value.address {
  line-height: 1.4;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.processing {
  background-color: #e3f2fd;
  color: #1565c0;
}

.tag {
  display: inline-block;
  background-color: #f0f4ff;
  color: #3f51b5;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.85rem;
  margin-right: 8px;
  margin-bottom: 5px;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8f9fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.btn-primary, .btn-secondary {
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;
}

.btn-primary:hover {
  background-color: #303f9f;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #3f51b5;
}

.btn-secondary:hover {
  background-color: #d1d8e6;
}

@media (max-width: 768px) {
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-filter input {
    width: 100%;
    margin-top: 10px;
  }
  
  .order-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-height: 80vh;
    margin: 10px;
    width: calc(100% - 20px);
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
}
</style>