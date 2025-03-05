<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="logo">
          <h1>Sales Order Manager</h1>
        </div>
        <nav class="main-nav">
          <ul>
            <li :class="{ active: $route.path === '/' }">
              <router-link to="/">Upload</router-link>
            </li>
            <li :class="{ active: $route.path === '/orders' }">
              <router-link to="/orders">Orders</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div v-if="notification.show" class="notification" :class="notification.type">
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" @click="closeNotification">&times;</button>
        </div>
        
        <router-view @upload-success="handleUploadSuccess" @upload-error="handleUploadError" />
      </div>
    </main>

  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      notification: {
        show: false,
        type: 'info',
        message: ''
      }
    };
  },
  methods: {
    showNotification(message, type = 'info') {
      this.notification = {
        show: true,
        type,
        message
      };
      
      setTimeout(this.closeNotification, 5000);
    },
    closeNotification() {
      this.notification.show = false;
    },
    handleUploadSuccess(response) {
      const recordCount = response.data?.totalRecords || 0;
      this.showNotification(`Successfully processed ${recordCount} records.`, 'success');
      
      this.$router.push('/orders');
    },
    handleUploadError(error) {
      this.showNotification(`Error: ${error}`, 'error');
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header styles */
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 1.5rem;
  color: #3f51b5;
  font-weight: 600;
}

.main-nav ul {
  display: flex;
  list-style: none;
}

.main-nav li {
  margin-left: 20px;
}

.main-nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.main-nav a:hover,
.main-nav li.active a {
  color: #3f51b5;
  background-color: rgba(63, 81, 181, 0.08);
}


.main-content {
  padding: 40px 0 60px;
  min-height: calc(100vh - 150px);
}

.page-title {
  margin-bottom: 30px;
  text-align: center;
}

.page-title h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-title p {
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}


.notification {
  position: relative;
  padding: 15px 20px;
  border-radius: 6px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.notification.error {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.notification.warning {
  background-color: #fff8e1;
  color: #f57f17;
  border-left: 4px solid #f57f17;
}

.notification.info {
  background-color: #e3f2fd;
  color: #1565c0;
  border-left: 4px solid #1565c0;
}

.notification-message {
  flex-grow: 1;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}


.app-footer {
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 20px 0;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.main-nav a.router-link-active {
  color: #3f51b5;
  background-color: rgba(63, 81, 181, 0.08);
}


@media (max-width: 768px) {
  .app-header .container {
    flex-direction: column;
  }
  
  .main-nav {
    margin-top: 15px;
  }
  
  .main-nav ul {
    justify-content: center;
  }
  
  .main-nav li:first-child {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .main-nav ul {
    flex-direction: column;
    align-items: center;
  }
  
  .main-nav li {
    margin: 5px 0;
    margin-left: 0;
  }
}

</style>