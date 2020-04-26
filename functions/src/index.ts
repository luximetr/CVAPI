import * as functions from 'firebase-functions';
const admin = require('firebase-admin');

const serviceAccount = require("../cvapp-8ebd9-firebase-adminsdk-9tzat-ce427f57b5.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cvapp-8ebd9.firebaseio.com",
  storageBucket: "cvapp-8ebd9.appspot.com"
});

const storage = admin.storage();
const firestore = admin.firestore();

export const requestOTP = functions.https.onRequest((request, response) => {
  if (request.method === 'GET') {
    response.send("Error")
  }
  console.log("phoneNumber:" + request.body.phone);
  response.send({
    "result": "success"
  });
});

export const authConfirmOTP = functions.https.onRequest((request, response) => {
  const userId = "asdasdasd";
  const jwt = userId;
  response.send({
    token: jwt
  });
});

export const changeUserName = functions.https.onRequest((request, response) => {
  console.log("Change name: " + request.body.name);
  response.send({
    result: "success"
  })
});

export const changeUserRole = functions.https.onRequest((request, response) => {
  console.log("Change role: " + request.body.role);
  response.send({
    result: "success"
  })
});

export const getUserCV = functions.https.onRequest((request, response) => {
  const userId = "userId";
  const cvId = "cvId";
  firestore
    .collection("users")
    .doc(userId)
    .collection("CVs")
    .doc(cvId)
    .get()
    .then((documentSnapshot: FirebaseFirestore.DocumentSnapshot) => {
      const userInfo = documentSnapshot.get("userInfo") as { [id: string]: any };
      const avatarURL = userInfo["avatarURL"] as string;
      response.send({
        id: "cvMockIDasdasdasd",
        userInfo: {
          avatarURL: avatarURL,
          name: 'Alexandr Orlov',
          role: 'Software developer'
        },
        contacts: {
          phones: [
            '+380664888176',
            '+6590378917'
          ],
          emails: [
            'job.aleksandrorlov@gmail.com'
          ],
          messangers: [
            {
              type: 'telegram',
              link: 'https://t.me/luximetr'
            }
          ]
        },
        experience: [
          {
            dateStart: '2016',
            dateEnd: '2018',
            companyName: 'Brander'
          },
          {
            dateStart: '2018',
            dateEnd: '2020',
            companyName: 'Deskera'
          },
          {
            dateStart: '2020',
            companyName: 'Google'
          }
        ],
        numbers: [
          {
            value: 3,
            title: 'years in iOS development'
          },
          {
            value: 11,
            title: 'projects I was involved'
          }
        ],
        skills: [
          {
            name: 'UI',
            skills: [
              'Snapkit',
              'PureLayout'
            ]
          },
          {
            name: 'Networking',
            skills: [
              'Alamofire',
              'NSURLSession'
            ]
          }
        ]
      });
    })

});

export const changeCVAvatar = functions.https.onRequest((request, response) => {
  const contentType = request.query.mimeType as string;
  const userId = "userId";
  const cvId = "cvId";
  const imageData = request.rawBody;
  const contentTypeTypeParts = contentType.split("/")
  const fileType = contentTypeTypeParts[contentTypeTypeParts.length - 1];
  const fileName = "avatar." + fileType;
  const filePath = "usersData/" + userId + "/" + fileName;

  // console.log({
  //   contentType: contentType,
  //   userId: userId,
  //   filePath: filePath,
  //   imageData: imageData
  // });

  const file = storage.bucket().file(filePath);
  const options = {
    contentType: contentType
  };

  file.save(imageData, options).then(() => {
    file.getSignedUrl(
      {
        action: "read",
        expires: '03-12-2025'
      }).then((getSignedResponse: string[]) => {
        const url = getSignedResponse[0];
        firestore
          .collection("users")
          .doc(userId)
          .collection("CVs")
          .doc(cvId)
          .set({userInfo: {avatarURL: url}}, {merge: true})
          .then(() => {
            response.send({url: url});
          });
    });
  });
});


