import { Sequelize } from 'sequelize-typescript';
import CustomerModel from '../db/sequelize/model/customer.model';
import Customer from '../../domain/entity/customer';
import CustomerRepository from './customer.repository';
import Address from '../../domain/entity/address';

describe('Customer repository test', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([CustomerModel]);

    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it('should create a customer', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('c1', 'John');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);

    await customerRepository.create(customer);

    const createdCustomer = await CustomerModel.findOne({
      where: { id: customer.id },
    });

    expect(createdCustomer.toJSON()).toStrictEqual({
      id: customer.id,
      name: customer.name,
      street: customer.Address.street,
      number: customer.Address.number,
      zipcode: customer.Address.zip,
      city: customer.Address.city,
      active: customer.isActive(),
      rewardPoints: customer.rewardPoints,
    });
  });

  it('should update a customer', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('c1', 'John');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);

    await customerRepository.create(customer);

    customer.changeName('Jane');
    customer.activate();
    customer.addRewardPoints(10);

    const newAddress = new Address('Second Street', 2, '12345', 'Springfield');
    customer.changeAddress(newAddress);

    await customerRepository.update(customer);

    const updatedCustomer = await CustomerModel.findOne({
      where: { id: customer.id },
    });

    expect(updatedCustomer.toJSON()).toStrictEqual({
      id: customer.id,
      name: 'Jane',
      street: customer.Address.street,
      number: customer.Address.number,
      zipcode: customer.Address.zip,
      city: customer.Address.city,
      active: customer.isActive(),
      rewardPoints: 10,
    });
  });

  it('should be able to find a customer', async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('c1', 'John');
    const address = new Address('Main Street', 1, '12345', 'Springfield');
    customer.changeAddress(address);

    await customerRepository.create(customer);

    const createdCustomer = await customerRepository.findById(customer.id);

    expect(createdCustomer).toStrictEqual(customer);
  });

  it('should throw an error when customer is not found', async () => {
    const customerRepository = new CustomerRepository();

    expect(async () => {
      await customerRepository.findById('213124');
    }).rejects.toThrow('Customer not found');
  });

  it('should be able to find all customers', async () => {
    const customerRepository = new CustomerRepository();
    const customer1 = new Customer('c1', 'John');
    const address1 = new Address('Main Street', 1, '12345', 'Springfield');
    customer1.changeAddress(address1);

    const customer2 = new Customer('c2', 'Jane');
    const address2 = new Address('Second Street', 2, '12345', 'Springfield');
    customer2.changeAddress(address2);

    await customerRepository.create(customer1);
    await customerRepository.create(customer2);

    const customers = await customerRepository.findAll();

    expect(customers).toEqual([customer1, customer2]);
  });
});
