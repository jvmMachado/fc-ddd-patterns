import CustomerCreatedEvent from './customer-created.event';
import SendMessageOneWhenCustomerCreatedHandler from './handler/send-console-log-1.handler';
import SendMessagetwoWhenCustomerCreatedHandler from './handler/send-console-log-2.handler';
import CustomerAddressChangedEvent from './customer-address-chenged.event';
import SendMessageWhenAddressChangeHandler from './handler/send-message-when-address-change.handler';
import EventDispatcher from '../@shared/event-dispatcher';
import Customer from '../../entity/customer';
import Address from '../../entity/address';

describe('domain events tests: customer', () => {
  it('should notify all event handlers when customer is created', () => {
    const eventDispatcher = new EventDispatcher();

    const sendMessageOneEventHandler =
      new SendMessageOneWhenCustomerCreatedHandler();

    const sendMessageTwoEventHandler =
      new SendMessagetwoWhenCustomerCreatedHandler();

    /**
     * spyEventHandler fica "espiando" se o método handle é executado
     */
    const spyEventHandlerMessageOne = jest.spyOn(
      sendMessageOneEventHandler,
      'handle'
    );
    const spyEventHandlerMessageTwo = jest.spyOn(
      sendMessageTwoEventHandler,
      'handle'
    );

    let customer = new Customer('123', 'Customer 1');

    eventDispatcher.register(
      'CustomerCreatedEvent',
      sendMessageOneEventHandler
    );
    eventDispatcher.register(
      'CustomerCreatedEvent',
      sendMessageTwoEventHandler
    );

    expect(
      eventDispatcher.getEventHandlers['CustomerCreatedEvent'][0]
    ).toMatchObject(sendMessageOneEventHandler);
    expect(
      eventDispatcher.getEventHandlers['CustomerCreatedEvent'][1]
    ).toMatchObject(sendMessageTwoEventHandler);

    const customerCreatedEvent = new CustomerCreatedEvent(customer);

    /**
     * Quando o notify for executado, o sendEmailWhenCustomerCreatedHandler.handler() deve ser chamado
     */
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandlerMessageOne).toHaveBeenCalled();
    expect(spyEventHandlerMessageTwo).toHaveBeenCalled();
  });

  it('should notify all event handlers when customer address change', () => {
    const eventDispatcher = new EventDispatcher();

    const sendMessageWhenAddressChangeHandler =
      new SendMessageWhenAddressChangeHandler();

    /**
     * spyEventHandler fica "espiando" se o método handle é executado
     */
    const spyEventHandlerMessageOne = jest.spyOn(
      sendMessageWhenAddressChangeHandler,
      'handle'
    );

    let customer = new Customer('123', 'Customer 1');

    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);

    eventDispatcher.register(
      'CustomerAddressChangedEvent',
      sendMessageWhenAddressChangeHandler
    );

    const customerAddressChangeEvent = new CustomerAddressChangedEvent(
      customer
    );

    /**
     * Quando o notify for executado, o sendEmailWhenCustomerCreatedHandler.handler() deve ser chamado
     */
    eventDispatcher.notify(customerAddressChangeEvent);

    expect(spyEventHandlerMessageOne).toHaveBeenCalled();
  });
});
