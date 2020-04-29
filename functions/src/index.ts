import * as functions from 'firebase-functions';
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
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
  response.send({
    "result": "success"
  });
});

export const authConfirmOTP = functions.https.onRequest((request, response) => {
  const code = request.body.code as string;
  if (code === 'sEcrEt17') {
    const jwt = "adminUserToken";
    response.send({
      token: jwt
    });
  } else {
    const jwt = "guestUserToken";
    response.send({
      token: jwt
    });
  }
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
  const userId = request.header("authToken") as string;
  const cvId = "cvId";
  firestore
    .collection("users")
    .where('id', '==', userId)
    .collection("CVs")
    .doc(cvId)
    .get()
    .then((documentSnapshot: FirebaseFirestore.DocumentSnapshot) => {
      response.send(documentSnapshot.data());
    });
});

export  const getNetworkCVs = functions.https.onRequest((request, response) => {
  const userId = request.header("authToken") as string;
  firestore
    .collection("users")
    .get()
    .then((snapshot: FirebaseFirestore.QuerySnapshot) => {
      const data = snapshot.docs.map((doc: DocumentSnapshot) => doc.data()) as [];
      const filteredData = data.filter((value: DocumentSnapshot) => value.id !== userId )
      response.send(filteredData);
    });

});


export const changeCVAvatar = functions.https.onRequest((request, response) => {
  const contentType = request.query.mimeType as string;
  const userId = "userId";
  const cvId = request.query.cvId as string;
  const imageData = request.rawBody;
  const contentTypeTypeParts = contentType.split("/")
  const fileType = contentTypeTypeParts[contentTypeTypeParts.length - 1];
  const fileName = "avatar." + fileType;
  const filePath = "usersData/" + userId + "/" + fileName;

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


