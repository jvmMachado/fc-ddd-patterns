import { Sequelize } from 'sequelize-typescript';
import CustomerModel from '../db/sequelize/model/customer.model';
import Order from '../../domain/entity/order';
import OrderItem from '../../domain/entity/order_item';
import OrderItemModel from '../db/sequelize/model/order-item.model';
import OrderModel from '../db/sequelize/model/order.model';
import OrderRepository from './order.repository';
import ProductModel from '../db/sequelize/model/product.model';
import CustomerRepository from './customer.repository';
import Customer from '../../domain/entity/customer';
import Address from '../../domain/entity/address';
import Product from '../../domain/entity/product';
import ProductRepository from './product.repository';
import { or } from 'sequelize';

describe('Order repository test', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);

    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should create a new order', async () => {
    const customerRepository = new CustomerRepository();
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();

    const customer = new Customer('c1', 'customer1');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product1 = new Product('pid1', 'product1', 10);
    const product2 = new Product('pid2', 'product2', 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const order = new Order('o1', 'c1', [
      new OrderItem('i1', 'p1', 10, 'pid1', 2),
      new OrderItem('i2', 'p2', 20, 'pid2', 3),
    ]);

    await orderRepository.create(order);

    const createdOrder = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(createdOrder.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: order.items[0].id,
          order_id: order.id,
          product_id: order.items[0].productId,
          price: order.items[0].price,
          quantity: order.items[0].quantity,
          name: order.items[0].name,
        },
        {
          id: order.items[1].id,
          order_id: order.id,
          product_id: order.items[1].productId,
          price: order.items[1].price,
          quantity: order.items[1].quantity,
          name: order.items[1].name,
        },
      ],
    });
  });

  it('should update an order', async () => {
    const customerRepository = new CustomerRepository();
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();

    const customer = new Customer('c1', 'customer1');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product1 = new Product('pid1', 'product1', 10);
    const product2 = new Product('pid2', 'product2', 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const order = new Order('o1', 'c1', [
      new OrderItem('i1', 'p1', 10, 'pid1', 2),
      new OrderItem('i2', 'p2', 20, 'pid2', 3),
    ]);

    await orderRepository.create(order);

    const createdOrder = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(createdOrder.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: order.items[0].id,
          order_id: order.id,
          product_id: order.items[0].productId,
          price: order.items[0].price,
          quantity: order.items[0].quantity,
          name: order.items[0].name,
        },
        {
          id: order.items[1].id,
          order_id: order.id,
          product_id: order.items[1].productId,
          price: order.items[1].price,
          quantity: order.items[1].quantity,
          name: order.items[1].name,
        },
      ],
    });

    order.items[0].quantity = 1;
    order.items[1].quantity = 2;
    order.items[0].price = 9;
    order.items[1].price = 18;

    await orderRepository.update(order);

    const updatedOrder = await OrderModel.findOne({
      where: { id: order.id },
      include: ['items'],
    });

    expect(updatedOrder.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: [
        {
          id: order.items[0].id,
          order_id: order.id,
          product_id: order.items[0].productId,
          price: 9,
          quantity: 1,
          name: order.items[0].name,
        },
        {
          id: order.items[1].id,
          order_id: order.id,
          product_id: order.items[1].productId,
          price: 18,
          quantity: 2,
          name: order.items[1].name,
        },
      ],
    });
  });

  it('should find an order by id', async () => {
    const customerRepository = new CustomerRepository();
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();

    const customer = new Customer('c1', 'customer1');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product1 = new Product('pid1', 'product1', 10);
    const product2 = new Product('pid2', 'product2', 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const order = new Order('o1', 'c1', [
      new OrderItem('i1', 'p1', 10, 'pid1', 2),
      new OrderItem('i2', 'p2', 20, 'pid2', 3),
    ]);

    await orderRepository.create(order);

    const cretedOrder = await orderRepository.findById(order.id);

    expect(cretedOrder).toEqual(order);
  });

  it('should find all orders', async () => {
    const customerRepository = new CustomerRepository();
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();

    const customer = new Customer('c1', 'customer1');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product1 = new Product('pid1', 'product1', 10);
    const product2 = new Product('pid2', 'product2', 20);
    const product3 = new Product('pid3', 'product3', 5);
    await productRepository.create(product1);
    await productRepository.create(product2);
    await productRepository.create(product3);

    const order1 = new Order('o1', 'c1', [
      new OrderItem('i1', 'p1', 10, 'pid1', 2),
      new OrderItem('i2', 'p2', 20, 'pid2', 3),
    ]);

    const order2 = new Order('o2', 'c1', [
      new OrderItem('i3', 'p1', 10, 'pid1', 2),
      new OrderItem('i4', 'p2', 20, 'pid2', 3),
    ]);

    const order3 = new Order('o3', 'c1', [
      new OrderItem('i5', 'p1', 10, 'pid1', 2),
      new OrderItem('i6', 'p3', 5, 'pid3', 2),
    ]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);
    await orderRepository.create(order3);

    const cretedOrders = await orderRepository.findAll();

    expect(cretedOrders).toEqual([order1, order2, order3]);
  });
});
