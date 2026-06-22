service PubSubService {

    action publishMessage(
        id   : Integer,
        name : String
    ) returns String;

}