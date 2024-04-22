import Order from '../../domain/entity/order';
import OrderItem from '../../domain/entity/order_item';
import OrderRepositoryInterface from '../../domain/repository/order-repository-interface';
import OrderItemModel from '../db/sequelize/model/order-item.model';
import OrderModel from '../db/sequelize/model/order.model';

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          order_id: entity.id,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
      { include: [OrderItemModel] }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
      },
      { where: { id: entity.id } }
    );

    await Promise.all(
      entity.items.map((item) => {
        return OrderItemModel.update(
          {
            id: item.id,
            order_id: entity.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
          { where: { id: item.id } }
        );
      })
    );
  }

  async findById(id: string): Promise<Order> {
    try {
      const orderFromModel = await OrderModel.findOne({
        where: { id },
        include: ['items'],
        rejectOnEmpty: true,
      });

      const order = new Order(
        orderFromModel.id,
        orderFromModel.customer_id,
        orderFromModel.items.map(
          (item) =>
            new OrderItem(
              item.id,
              item.name,
              item.price,
              item.product_id,
              item.quantity
            )
        )
      );

      return order;
    } catch (e) {
      throw new Error('Order not found');
    }
  }

  async findAll(): Promise<Order[]> {
    const ordersFromModel = await OrderModel.findAll({
      include: ['items'],
    });

    const orders = ordersFromModel.map((order) => {
      return new Order(
        order.id,
        order.customer_id,
        order.items.map(
          (item) =>
            new OrderItem(
              item.id,
              item.name,
              item.price,
              item.product_id,
              item.quantity
            )
        )
      );
    });

    return orders;
  }
}
