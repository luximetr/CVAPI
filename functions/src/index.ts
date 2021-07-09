import * as functions from "firebase-functions";
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
  const jwt = getJWTForCode(code);
  response.send({
    token: jwt
  });
});

function getJWTForCode(code: string): string {
  if (code === 'sEcrEt17') {
    return "userId"
  } else {
    return "guestUserId"
  }
}

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

enum ErrorCode {
  entityNotFound = 1
}

export const getUserCV = functions.https.onRequest((request, response) => {
  const userId = request.header("authToken") as string;
  firestore
    .collection("users")
    .doc(userId)
    .collection("CVs")
    .get()
    .then((snapshot: FirebaseFirestore.QuerySnapshot) => {
      const firstCV = snapshot.docs[0].data()
      if (firstCV !== undefined) {
        response.send({
          success: true,
          data: firstCV
        })
      } else {
        response.send({
          success: false,
          error: {
            message: "CV not found",
            code: ErrorCode.entityNotFound
          }
        })
      }
    })
});

export const getNetworkCVs = functions.https.onRequest((request, response) => {
  const userId = request.header("authToken") as string;
  firestore
      .collectionGroup('CVs')
      .get()
      .then((snapshot: FirebaseFirestore.QuerySnapshot) => {
        const allData = snapshot.docs.map((doc) => {return doc.data()})
        const data = allData.filter((value) => value.userId !== userId )
        response.send({
          success: true,
          data: data
        })
  });
});

export const getNetworkCV = functions.https.onRequest((request, response) => {
  const cvId = request.body.id as string;
  firestore
      .collectionGroup('CVs')
      .where('id', '==', cvId)
      .get()
      .then((snapshot: FirebaseFirestore.QuerySnapshot) => {
        const data = snapshot.docs[0].data()
        response.send({
          success: true,
          data: data
        })
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


