import EventInterface from '../@shared/event.interface';

export default class CustomerAddressChangedEvent implements EventInterface {
  dataTimeOcurred: Date;
  eventData: any;

  constructor(eventData: any) {
    this.dataTimeOcurred = new Date();
    this.eventData = eventData;
  }
}
