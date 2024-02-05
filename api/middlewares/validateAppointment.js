import validator from 'validator';

export default function validateAppointment(req, res, next) {

  if (req?.body) {

    const timeRangeId = req.body?.timeRangeId?.toString()?.trim()?.normalize('NFC') ?? '';
    const isValidTimeRangeId = validator.isInt('' + timeRangeId, { gt: 0 });

    let phoneNumber = req.body?.phoneNumber?.toString()?.trim()?.normalize('NFC') ?? '';
    const isValidPhoneNumber = validator.isMobilePhone(phoneNumber, 'ro-RO');

    const participants = req.body?.participants;

    let areValidParticipants = true;

    if (!participants || !participants?.length) {

      areValidParticipants = false;

    } else {

      for (let i = 0, p = participants.length; i < p; ++i) {

        participants[i].firstName = participants[i]?.firstName?.toString()?.trim()?.normalize('NFC') ?? '';
        participants[i].lastName = participants[i]?.lastName?.toString()?.trim()?.normalize('NFC') ?? '';
        participants[i].age = participants[i]?.age?.toString()?.trim()?.normalize('NFC') ?? '';
        participants[i].personnelCategoryId = participants[i]?.personnelCategoryId?.toString()?.trim()?.normalize('NFC') ?? '';

        const isValidFirstName = validator.isLength(participants[i].firstName, { min: 1, max: 256 });
        const isValidLastName = validator.isLength(participants[i].lastName, { min: 1, max: 256 });
        const isValidAge = ['minor', 'adult'].includes(participants[i].age);
        const isValidPersonnelCategoryId = validator.isInt('' + participants[i].personnelCategoryId, { gt: 0 });

        const allFieldsAreValid = 
          isValidFirstName            &&
          isValidLastName             &&
          isValidAge                  &&
          isValidPersonnelCategoryId;

        if (!allFieldsAreValid) {

          areValidParticipants = false;
          break;

        }

      }

    }

    const allDataIsValid =
      isValidTimeRangeId    &&
      isValidPhoneNumber    &&
      areValidParticipants;
    
    if (allDataIsValid) {
      
      // remove the leading '+4'
      if (phoneNumber.startsWith('+4') && 12 === phoneNumber.length) {

        phoneNumber = phoneNumber.substring(2);

      }

      req.body = { timeRangeId, phoneNumber, participants };

      return next();

    }

  }

  return res.status(400)
  .json({
    data: {
      message: 'Bad Request'
    }
  });

}