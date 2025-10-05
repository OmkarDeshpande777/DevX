const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models/database');

// Get user's cart items
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cartItems = await Cart.findByUserId(userId);
    const cartStats = await Cart.getCartStats(userId);
    
    res.json({
      status: 'success',
      data: {
        items: cartItems,
        stats: cartStats
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart items'
    });
  }
});

// Add item to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }

    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        status: 'error',
        message: 'Product is out of stock'
      });
    }

    const result = await Cart.addItem(userId, productId, quantity);
    const cartStats = await Cart.getCartStats(userId);
    
    res.json({
      status: 'success',
      message: result.updated ? 'Cart item updated' : 'Item added to cart',
      data: {
        ...result,
        stats: cartStats
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart'
    });
  }
});

// Remove item from cart
router.delete('/:userId/remove/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const removed = await Cart.removeItem(userId, productId);
    
    if (!removed) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    const cartStats = await Cart.getCartStats(userId);
    
    res.json({
      status: 'success',
      message: 'Item removed from cart',
      data: {
        stats: cartStats
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove item from cart'
    });
  }
});

// Update item quantity in cart
router.put('/:userId/update/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid quantity is required'
      });
    }

    const updated = await Cart.updateQuantity(userId, productId, quantity);
    
    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart'
      });
    }

    const cartStats = await Cart.getCartStats(userId);
    
    res.json({
      status: 'success',
      message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated',
      data: {
        stats: cartStats
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item'
    });
  }
});

// Clear entire cart
router.delete('/:userId/clear', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const removedCount = await Cart.clearCart(userId);
    
    res.json({
      status: 'success',
      message: 'Cart cleared',
      data: {
        removedItems: removedCount
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart'
    });
  }
});

module.exports = router;