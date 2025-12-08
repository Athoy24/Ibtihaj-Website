import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
