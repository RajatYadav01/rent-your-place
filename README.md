# Rent Your Place

## Table of contents

- [Rent Your Place](#rent-your-place)
  - [Table of contents](#table-of-contents)
  - [About](#about)
    - [Overview](#overview)
    - [Key features](#key-features)
  - [Usage](#usage)
  - [Working](#working)
  - [Development](#development)
    - [Requirements](#requirements)
    - [Setup](#setup)

## About

### Overview

The goal of this project is to help connect tenants and property owners. Tenants can find the appropriate property based on their key requirements from the variety of properties posted by different owners. Owners can post properties to find suitable tenants.

### Key features

- Mandatory **authentication** for both owners and tenants for performing important actions.
- Form handling is done with proper **validation** both at the client and server side.
- **JSON Web Token (JWT)** is used for serverless authentication. A token is issued to the user during the log in process and after the token expires the user is logged out automatically.
- Any user can use the **live filters** based on attributes of the property to filter out properties either by applying a single filter or multiple filters simultaneously.
- Like count is tracked live for each property using the **Like** button.
- Proper **pagination** is provided for viewing all the properties.

## Usage

To use the project you can visit [RajatYadav01.github.io/rent-your-place](https://rajatyadav01.github.io/rent-your-place/) which hosts the projects's front end. The back end of project is hosted on [Render](https://render.com) and the database is hosted on [Neon](https://neon.tech).

## Working

All users can view all the properties posted and apply filters based on any attribute of the property. But to perform actions like **adding a property**, **updating a property**, clicking on the **Like** button, clicking on the **I'm interested** button, etc., the user needs to be registered.

The user can register by providing the following details:

- **User type**
- **First name**
- **Last name**
- **Email address**
- **Phone number**
- **Password**

Then, the user can log in by entering the following details:

- **Email address**
- **Password**

**Owner flow**:

- Owner can view all the rental properties posted by him/her as well as the other owners.
- Owner can update all his/her profile details except the email address by clicking the **Update profile** button. *If the owner changes the user type from Owner to Tenant then all the properties added by him/her are deleted permanently*.
- Owner can add a property by clicking on the **Add property** button and provide details about the property i.e., country, place, total area, number of bedrooms, number of bathrooms, nearby landmark.
- Owner can update any attribute of any property added by him/her by clicking the **Update** button on the property widget.
- Owner can delete any property added by him/her by clicking the **Delete** button on the property widget.
- Owner can choose to view only the properties added by himself/herself or view only his/her favourite properties by applying a filter.
- Owner can Like a property added by other owners by clicking on the **Like** button on the property widget and can unlike an already liked property by clicking on the same button again.
- If an owner is interested in any property posted by another owner, he/she can click the **I'm interested** button on the property widget to show the contact details of the owner of that property.

**Tenant flow**:

- Tenant can view all the rental properties posted by each owner.
- Tenant can update all his/her profile details except the email address by clicking the **Update profile** button.
- Tenant can choose to view only his/her favourite properties by applying a filter.
- Tenant can Like properties added by other owners by clicking on the **Like** button on the property widget and can unlike a property if already liked by clicking on the same button again.
- If a tenant is interested in any property, he/she can click the **I'm interested** button on the property widget to show the contact details of the owner of that property.

## Development

### Requirements

You need to have the following installed on your system:

- Node.js (preferably, version >= v20.x)
- npm (preferably, version >= v10.x)
- PostgreSQL (preferably, version >= v16.x)
- Git (preferably the latest version)
- Docker (preferably the latest version)

### Setup

To modify and use this project locally on your system, follow these steps:

1) Clone the project's repository.

   ```shell
   git clone https://github.com/rajatyadav01/rent-your-place.git
   ```

2) Go to the project folder using the CLI.

   ```shell
   cd rent-your-place
   ```

3) Install all the dependencies using npm.

   ```shell
   npm install
   ```

4) Rename the `.env.example` file as `.env` in the main project folder to use the environment variables in the React application.

5) Open the backend folder of the project either in a different instance of the code editor or in a different instance of the CLI that you are using.

6) Install all the dependencies using npm in the backend folder.

   ```shell
   npm install
   ```

7) Create a `user` with `password` and a `database` using the created `user` as owner in the PostgreSQL database since those are required to connect to the database. For this, you can either use the default values from the `env.example` file or use different values after updating them in the `env.example` file. Also, values of other variables can also be updated in the `env.example` file based on your preference.

8) Run the Node server in the backend folder.

   ```shell
   npm run dev
   ```

9) Go to the main project folder which is already open in other instance of the code editor and run the React application.

   ```shell
   npm run start
   ```

10) After the React application has started, open any browser and go to `http://localhost:3000` to access the application.<br /><br />

To setup the project using Docker:

1) Clone the project's repository.

   ```shell
   git clone https://github.com/rajatyadav01/rent-your-place.git
   ```

2) Go to the project folder using the CLI.

   ```shell
   cd rent-your-place
   ```

3) Run the project using docker-compose.

   ```shell
   docker-compose up --build
   ```

4) After all the containers have been started, open any browser and go to `http://localhost:3000` to access the application.
