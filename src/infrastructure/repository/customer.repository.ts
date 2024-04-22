import Address from '../../domain/entity/address';
import Customer from '../../domain/entity/customer';
import CustomerRepositoryInterface from '../../domain/repository/customer-repository-interface';
import CustomerModel from '../db/sequelize/model/customer.model';

export default class CustomerRepository implements CustomerRepositoryInterface {
  async create(entity: Customer): Promise<void> {
    await CustomerModel.create({
      id: entity.id,
      name: entity.name,
      street: entity.Address.street,
      number: entity.Address.number,
      zipcode: entity.Address.zip,
      city: entity.Address.city,
      active: entity.isActive(),
      rewardPoints: entity.rewardPoints,
    });
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.Address.street,
        number: entity.Address.number,
        zipcode: entity.Address.zip,
        city: entity.Address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      { where: { id: entity.id } }
    );
  }

  async findById(id: string): Promise<Customer> {
    let customerFromModel;
    try {
      customerFromModel = await CustomerModel.findOne({
        where: { id },
        rejectOnEmpty: true,
      });

      const customer = new Customer(
        customerFromModel.id,
        customerFromModel.name
      );
      const address = new Address(
        customerFromModel.street,
        customerFromModel.number,
        customerFromModel.zipcode,
        customerFromModel.city
      );
      customer.changeAddress(address);
      customer.addRewardPoints(customerFromModel.rewardPoints);

      if (customerFromModel.active) {
        customer.activate();
      }

      return customer;
    } catch (error) {
      throw new Error('Customer not found');
    }
  }

  async findAll(): Promise<Customer[]> {
    const customersFromModel = await CustomerModel.findAll();

    return customersFromModel.map((customerFromModel) => {
      const customer = new Customer(
        customerFromModel.id,
        customerFromModel.name
      );
      const address = new Address(
        customerFromModel.street,
        customerFromModel.number,
        customerFromModel.zipcode,
        customerFromModel.city
      );
      customer.changeAddress(address);
      customer.addRewardPoints(customerFromModel.rewardPoints);

      if (customerFromModel.active) {
        customer.activate();
      }

      return customer;
    });
  }
}
