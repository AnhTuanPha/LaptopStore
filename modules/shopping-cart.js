module.exports = function (cart) {
  if (!cart || !cart.items) {
    this.items = {};
  }
  else {
    this.items = cart.items;
  }

  this.addItem = (id, item) => {
    let obj = this.items[`${id}`];

    if (!obj) {
      obj = {
        item,
        quantity: 0,
        price: 0
      };
    }
    obj.quantity = obj.quantity + 1;

    if (item.sale > 0) {
      obj.price = obj.quantity * item.salePrice;
    }
    else {
      obj.price = obj.quantity * item.price;
    }
    
    this.items[`${id}`] = obj;
  };

  this.updateQuantity = (id, quantity) => {
    const obj = this.items[`${id}`];

    if (obj) {
      obj.quantity = quantity;

      if (obj.item.sale > 0) {
        obj.price = quantity * obj.item.salePrice;
      }
      else {
        obj.price = quantity * obj.item.price;
      }
    }
  };

  this.delete = (id) => {
    delete this.items[`${id}`];
  };

  this.getItemList = function(){
    const arr = [];
    
    for (let id in this.items){
      arr.push(this.items[`${id}`]);
    }

    return arr;
  };
};
