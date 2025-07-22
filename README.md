<img src="./src/assets/images/icon.png" alt="Rep Report Logo" width="200" height="200">

# RepReport

Mobile fitness app made using Expo/React Native to track fitness progress.
I started this project to easly keep track of my fitness journey and quickly find the information I need to start my next workout.

[Screenshots](https://drive.google.com/drive/folders/1_XpxrWVO62c_I5oR7oxHKVaOUKava-yq?usp=sharing)

[Android APK](https://drive.google.com/file/d/1OawCqNwQgGWZ6iXD57Rec8-UlHjoLxzK/view?usp=sharing)

## Audience

This app is targeted towards people who are beginning their fitness journey and require an easy and quick tool to track and record their progress.

# Features

## Search

The user can search for exercises and filter exercises.

## Save Exercises

The user can save what exercises they completed every day, as well as view previous sets, reps, and weight used.

## Workout Collection

The can create a workout collection of exercises.

# Technical

## Framework

This app is built using the Expo framework. This framework utilizes React Native and TypeScript. Additionally, we use NativeWind for styling.

## API

This app uses the WGER Rest API to provide users the ability to search and filter exercises.

## Backend

This app uses SQLite as the backend. All data is stored locally. Drizzle as an ORM

# Setup & Running Locally

Follow these steps to set up and run the app for the first time:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/rep-report.git
   cd rep-report
   ```

2. **Install dependencies**
   Make sure you have [Node.js](https://nodejs.org/) and [Expo CLI](https://docs.expo.dev/get-started/installation/) installed.

   ```bash
   npm install
   ```

3. **Setup NativeWind**

   Follow the steps [here](https://www.nativewind.dev/docs/getting-started/installation#installation-with-expo) to ensure NativeWind is Setup.

4. **Start the Expo development server**

   ```bash
   npx expo start
   ```

5. **Run on your device**

   - Download the Expo Go app from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
   - Scan the QR code displayed in your terminal or browser.

6. **Troubleshooting**
   - If you encounter issues, ensure your dependencies are up to date:
     ```bash
     npm install --legacy-peer-deps
     ```
   - Refer to the [Expo documentation](https://docs.expo.dev/) for more help.

## Migrations

Migration files can be found under the drizzle directory

To update the database, update the schema.ts file under the db directory and run the following generate a new migration file.

```
npx drizzle-kit generate
```

Migration file will be applied when the app restarts
