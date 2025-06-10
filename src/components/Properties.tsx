import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { LoginSuccessStatusContext } from "../App";
import Pagination from "./Pagination";
import Filter from "./Filter";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/Properties.css";

type PropertiesPropsType = {
  userID: string;
  newPropertyAdded: boolean | null;
  propertyUpdated: boolean | null;
  setPropertyFormInitialValues: React.Dispatch<
    React.SetStateAction<PropertyType>
  > | null;
};

type PropertyType = {
  id: string;
  country: string | null;
  place: string | null;
  totalArea: number | string | null;
  numberOfBedrooms: number | string | null;
  numberOfBathrooms: number | string | null;
  nearbyLandmark: string | null;
  monthlyRent: number | string | null;
  currencyUnit: string | null;
  ownerID: string | null;
  likeCount: number;
  likedByUserIDs: string[] | null;
};

const createChunks = (array: PropertyType[], size: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

function Properties(props: PropertiesPropsType) {
  const propertiesList = useRef<PropertyType[] | null>(null);
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loadingIconState, setLoadingIconState] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [propertiesPerPage, setPropertiesPerPage] = useState(10);
  const [propertiesError, setPropertiesError] = useState("");

  const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);

  const navigate = useNavigate();

  const getProperties = async () => {
    try {
      setLoadingIconState(true);
      const serverResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/properties/get`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (serverResponse.data.properties) {
        setLoadingIconState(false);
        propertiesList.current = serverResponse.data.properties;
        if (propertiesList.current) setProperties(propertiesList.current);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          setPropertiesError(errorMessage);
          setLoadingIconState(false);
        }
      }
    }
  };

  useEffect(() => {
    getProperties();
  }, [props.newPropertyAdded, props.propertyUpdated]);

  function searchStringInArray(string: string, array: string[] | null) {
    if (array) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].match(string)) return i;
      }
    }
    return -1;
  }

  const likeProperty = (
    propertyID: string,
    propertyLikeCount: number,
    propertyLikedByUserIDs: string[] | null
  ) => {
    if (!loginSuccessStatusContext.loginStatusState.loggedIn) {
      navigate("/login");
      toast.error("Log in to perform this action.");
    } else if (
      loginSuccessStatusContext.loginStatusState.loggedIn === true &&
      loginSuccessStatusContext.loginStatusState.loginUserType
    ) {
      (async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_API_URL}/users/getID`,
            {
              headers: {
                "Content-Type": "application/json",
                Token: localStorage.token,
              },
              withCredentials: true,
            }
          );
          if (response.data.userID) {
            try {
              setPropertiesError("");
              const ifAlreadyLiked = searchStringInArray(
                response.data.userID,
                propertyLikedByUserIDs
              );
              if (ifAlreadyLiked === -1) {
                let newLikeCount = propertyLikeCount + 1;
                const updatedLikeCount = {
                  id: propertyID,
                  country: null,
                  place: null,
                  totalArea: null,
                  numberOfBedrooms: null,
                  numberOfBathrooms: null,
                  nearbyLandmark: null,
                  monthlyRent: null,
                  currencyUnit: null,
                  ownerID: null,
                  likeCount: newLikeCount,
                  likedByUserIDs: response.data.userID,
                };
                const serverResponse = await axios.patch(
                  `${process.env.REACT_APP_BACKEND_API_URL}/properties/update`,
                  JSON.stringify(updatedLikeCount),
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    withCredentials: true,
                  }
                );
                if (
                  serverResponse.data.message === "Updated" &&
                  serverResponse.data.propertyID
                ) {
                  toast.info("You liked this property");
                  getProperties();
                }
              } else if (ifAlreadyLiked > -1) {
                const updateUnlikedProperty = {
                  id: propertyID,
                  unlikedByUserID: response.data.userID,
                };
                const serverResponse = await axios.patch(
                  `${process.env.REACT_APP_BACKEND_API_URL}/properties/unlikeProperty`,
                  JSON.stringify(updateUnlikedProperty),
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    withCredentials: true,
                  }
                );
                if (
                  serverResponse.data.message === "Updated" &&
                  serverResponse.data.propertyID
                ) {
                  toast.info("You unliked this property");
                  getProperties();
                }
              }
            } catch (error: unknown) {
              if (axios.isAxiosError(error)) {
                if (error) {
                  console.error(error);
                  const errorMessage = error.response?.data
                    ? error.response?.data.message
                    : error.message;
                  setPropertiesError(errorMessage);
                }
              }
            }
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            if (error) {
              console.error(error);
              const errorMessage = error.response?.data
                ? error.response?.data.message
                : error.message;
            }
          }
        }
      })();
    }
  };

  const selectedProperty = useRef("");
  const [ownerDetails, setOwnerDetails] = useState<{
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
  } | null>(null);

  const interestedInProperty = async (
    propertyID: string,
    ownerID: string | null
  ) => {
    if (!loginSuccessStatusContext.loginStatusState.loggedIn) {
      navigate("/login");
      toast.error("Log in to perform this action.");
    } else if (
      loginSuccessStatusContext.loginStatusState.loggedIn === true &&
      loginSuccessStatusContext.loginStatusState.loginUserType
    ) {
      try {
        const serverResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_API_URL}/properties/get-owner`,
          {
            headers: {
              "Content-Type": "application/json",
              ID: ownerID,
            },
            withCredentials: true,
          }
        );
        if (
          serverResponse.data.fullName &&
          serverResponse.data.emailAddress &&
          serverResponse.data.phoneNumber
        ) {
          selectedProperty.current = propertyID;
          setOwnerDetails({
            fullName: serverResponse.data.fullName,
            emailAddress: serverResponse.data.emailAddress,
            phoneNumber: serverResponse.data.phoneNumber,
          });
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data
              ? error.response?.data.message
              : error.message;
            setPropertiesError(errorMessage);
          }
        }
      }
    }
  };

  const [isAnimating, setIsAnimating] = useState(false);

  const closeOwnerDetails = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setOwnerDetails(null);
      selectedProperty.current = "";
      setIsAnimating(false);
    }, 500);
  };

  const updateProperty = (
    idValue: string,
    countryValue: string | null,
    placeValue: string | null,
    totalAreaValue: number | string | null,
    numberOfBedroomsValue: number | string | null,
    numberOfBathroomsValue: number | string | null,
    nearbyLandmarkValue: string | null,
    monthlyRentValue: number | string | null,
    currencyUnitValue: string | null,
    ownerIDValue: string | null
  ) => {
    if (props.setPropertyFormInitialValues !== null) {
      props.setPropertyFormInitialValues({
        id: idValue,
        country: countryValue,
        place: placeValue,
        totalArea: totalAreaValue,
        numberOfBedrooms: numberOfBedroomsValue,
        numberOfBathrooms: numberOfBathroomsValue,
        nearbyLandmark: nearbyLandmarkValue,
        monthlyRent: monthlyRentValue,
        currencyUnit: currencyUnitValue,
        ownerID: ownerIDValue,
        likeCount: 0,
        likedByUserIDs: null,
      });
    }
    navigate("update-property");
  };

  const [propertyToBeDeleted, setPropertyToBeDeleted] = useState("");

  function confirmDeleteProperty(id: string) {
    setPropertyToBeDeleted(id);
  }

  const deleteProperty = async (propertyID: string) => {
    try {
      setPropertyToBeDeleted("");
      const serverResponse = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API_URL}/properties/delete`,
        {
          headers: {
            "Content-Type": "application/json",
            ID: propertyID,
          },
          withCredentials: true,
        }
      );
      if (serverResponse.data.message === "Deleted") {
        toast.success("Property deleted successfully");
        getProperties();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          setPropertiesError(errorMessage);
        }
      }
    }
  };

  const indexOfLastProperty = currentPageNumber * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentPageNumberProperties = properties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );
  const totalNumberOfPages = Math.ceil(properties.length / propertiesPerPage);

  const propertiesListChunks = createChunks(currentPageNumberProperties, 4);

  const changePropertiesPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPropertiesPerPage(parseInt(event.target.value, 10));
  };

  const paginate = (
    selectionType: string,
    selectedPageNumber: string | number
  ) => {
    if (selectionType === "Previous" && currentPageNumber > 1)
      setCurrentPageNumber(currentPageNumber - 1);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "number"
    )
      setCurrentPageNumber(selectedPageNumber);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "string" &&
      selectedPageNumber === "... "
    )
      setCurrentPageNumber(1);
    else if (
      selectionType === "Change" &&
      typeof selectedPageNumber === "string" &&
      selectedPageNumber === " ..."
    )
      setCurrentPageNumber(totalNumberOfPages);
    else if (selectionType === "Next" && currentPageNumber < totalNumberOfPages)
      setCurrentPageNumber(currentPageNumber + 1);
  };

  const filteredProperties = useRef<PropertyType[] | null>(null);
  const [countryFilter, setCountryFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [minimumAreaFilter, setMinimumAreaFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [maximumAreaFilter, setMaximumAreaFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [numberOfBedroomsFilter, setNumberOfBedroomsFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [numberOfBathroomsFilter, setNumberOfBathroomsFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [nearbyLandmarkFilter, setNearbyLandmarkFilter] = useState("");
  const [minimumMonthlyRentFilter, setMinimumMonthlyRentFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [maximumMonthlyRentFilter, setMaximumMonthlyRentFilter] = useState<
    typeof NaN | number
  >(NaN);
  const [currencyUnitFilter, setCurrencyUnitFilter] = useState("INR");

  const ownerPropertiesOnlyInitialState =
    localStorage.getItem("showOwnerProperties")?.toLowerCase?.() === "true";
  const [ownerPropertiesOnlyFilter, setOwnerPropertiesOnlyFilter] = useState(
    ownerPropertiesOnlyInitialState
  );
  const handleUserPropertiesCheckbox = () => {
    setOwnerPropertiesOnlyFilter(!ownerPropertiesOnlyFilter);
    localStorage.setItem(
      "showOwnerProperties",
      `${!ownerPropertiesOnlyFilter}`
    );
  };

  const likedPropertiesOnlyInitialState =
    localStorage.getItem("showLikedProperties")?.toLowerCase?.() === "true";
  const [likedPropertiesOnlyFilter, setLikedPropertiesOnlyFilter] = useState(
    likedPropertiesOnlyInitialState
  );
  const handleLikedPropertiesCheckbox = () => {
    setLikedPropertiesOnlyFilter(!likedPropertiesOnlyFilter);
    localStorage.setItem(
      "showLikedProperties",
      `${!likedPropertiesOnlyFilter}`
    );
  };

  useEffect(() => {
    if (
      ownerPropertiesOnlyFilter === false ||
      likedPropertiesOnlyFilter === false ||
      countryFilter === "" ||
      placeFilter === "" ||
      Number.isNaN(minimumAreaFilter) ||
      Number.isNaN(maximumAreaFilter) ||
      Number.isNaN(numberOfBedroomsFilter) ||
      Number.isNaN(numberOfBathroomsFilter) ||
      nearbyLandmarkFilter === "" ||
      Number.isNaN(minimumMonthlyRentFilter) ||
      Number.isNaN(maximumMonthlyRentFilter) ||
      currencyUnitFilter === ""
    ) {
      if (propertiesList.current) {
        setProperties(propertiesList.current);
        filteredProperties.current = propertiesList.current;
      }
    }
    if (ownerPropertiesOnlyFilter !== false) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (property.ownerID !== null && props.userID !== null)
              return property.ownerID.includes(props.userID);
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (likedPropertiesOnlyFilter !== false) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (property.likeCount !== null && property.likedByUserIDs !== null)
              return property.likedByUserIDs.includes(props.userID);
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (countryFilter !== "") {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (property.country !== null)
              return countryFilter.toLowerCase() === ""
                ? property
                : property.country
                    .toLowerCase()
                    .includes(countryFilter.toLowerCase());
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (placeFilter !== "") {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (property.place !== null)
              return placeFilter.toLowerCase() === ""
                ? property
                : property.place
                    .toLowerCase()
                    .includes(placeFilter.toLowerCase());
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(minimumAreaFilter)) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.totalArea !== null &&
              typeof property.totalArea === "number"
            )
              return property.totalArea >= minimumAreaFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(maximumAreaFilter)) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.totalArea !== null &&
              typeof property.totalArea === "number"
            )
              return property.totalArea <= maximumAreaFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(numberOfBedroomsFilter)) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.numberOfBedrooms !== null &&
              typeof property.numberOfBedrooms === "number"
            )
              return property.numberOfBedrooms >= numberOfBedroomsFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(numberOfBathroomsFilter)) {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.numberOfBathrooms !== null &&
              typeof property.numberOfBathrooms === "number"
            )
              return property.numberOfBathrooms >= numberOfBathroomsFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (nearbyLandmarkFilter !== "") {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (property.nearbyLandmark !== null)
              return nearbyLandmarkFilter.toLowerCase() === ""
                ? property
                : property.nearbyLandmark
                    .toLowerCase()
                    .includes(nearbyLandmarkFilter.toLowerCase());
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(minimumMonthlyRentFilter) && currencyUnitFilter !== "") {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.monthlyRent !== null &&
              typeof property.monthlyRent === "number" &&
              property.currencyUnit === currencyUnitFilter
            )
              return property.monthlyRent >= minimumMonthlyRentFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
    if (!Number.isNaN(maximumMonthlyRentFilter) && currencyUnitFilter !== "") {
      if (filteredProperties.current) {
        filteredProperties.current = filteredProperties.current.filter(
          (property) => {
            if (
              property.monthlyRent !== null &&
              typeof property.monthlyRent === "number" &&
              property.currencyUnit === currencyUnitFilter
            )
              return property.monthlyRent <= maximumMonthlyRentFilter;
          }
        );
        setProperties(filteredProperties.current);
      }
    }
  }, [
    ownerPropertiesOnlyFilter,
    likedPropertiesOnlyFilter,
    countryFilter,
    placeFilter,
    minimumAreaFilter,
    maximumAreaFilter,
    numberOfBedroomsFilter,
    numberOfBathroomsFilter,
    nearbyLandmarkFilter,
    minimumMonthlyRentFilter,
    maximumMonthlyRentFilter,
    currencyUnitFilter,
  ]);

  return (
    <div className="properties-container" id="properties-list">
      <h2 className="properties-container__heading">Properties</h2>
      {propertiesError && (
        <p className="properties-container__show-error" aria-live="assertive">
          {propertiesError}
        </p>
      )}
      <div className="properties-container__filters-and-properties-list-container">
        <Filter
          setCountryFilter={setCountryFilter}
          setPlaceFilter={setPlaceFilter}
          setMinimumAreaFilter={setMinimumAreaFilter}
          setMaximumAreaFilter={setMaximumAreaFilter}
          setNumberOfBedroomsFilter={setNumberOfBedroomsFilter}
          setNumberOfBathroomsFilter={setNumberOfBathroomsFilter}
          setNearbyLandmarkFilter={setNearbyLandmarkFilter}
          setMinimumMonthlyRentFilter={setMinimumMonthlyRentFilter}
          setMaximumMonthlyRentFilter={setMaximumMonthlyRentFilter}
          currencyUnitFilter={currencyUnitFilter}
          setCurrencyUnitFilter={setCurrencyUnitFilter}
          ownerPropertiesOnlyFilter={ownerPropertiesOnlyFilter}
          handleUserPropertiesCheckbox={handleUserPropertiesCheckbox}
          likedPropertiesOnlyFilter={likedPropertiesOnlyFilter}
          handleLikedPropertiesCheckbox={handleLikedPropertiesCheckbox}
        />
        {loadingIconState ? (
          <div className="d-flex justify-content-center">
            <div
              className="spinner-border"
              style={{ width: "4rem", height: "4rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="properties-container__properties-list-container">
            {properties.length !== 0 ? (
              propertiesListChunks.map((chunk, i) => (
                <div className="properties-container__properties-list" key={i}>
                  {chunk.map((property) => (
                    <ul
                      className="properties-container__property"
                      key={property.id}
                    >
                      <li className="properties-container__property-attributes-container">
                        <p
                          className="properties-container__property-attribute"
                          key={`${"c"}-${property.country}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Country
                          </span>
                          : {property.country}
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"p"}-${property.place}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Place
                          </span>
                          : {property.place}
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"ta"}-${property.totalArea}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Area
                          </span>
                          : {property.totalArea} sq. ft.
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"nor"}-${property.numberOfBedrooms}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Number of bedrooms
                          </span>
                          : {property.numberOfBedrooms}
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"nob"}-${property.numberOfBathrooms}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Number of bathrooms
                          </span>
                          : {property.numberOfBathrooms}
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"nl"}-${property.nearbyLandmark}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Nearby landmark
                          </span>
                          : {property.nearbyLandmark}
                        </p>
                        <p
                          className="properties-container__property-attribute"
                          key={`${"mr"}-${property.monthlyRent}`}
                        >
                          <span className="properties-container__property-attribute-label">
                            Rent
                          </span>
                          : {property.monthlyRent} {property.currencyUnit}/month
                        </p>
                      </li>
                      <li className="properties-container__property-buttons-container">
                        {loginSuccessStatusContext.loginStatusState
                          .loginUserType === "owner" &&
                        property.ownerID === props.userID ? (
                          <Fragment>
                            <button
                              className="properties-container__button properties-container__button--update"
                              key={`${"ub"}-${property.id}`}
                              onClick={() =>
                                updateProperty(
                                  property.id,
                                  property.country,
                                  property.place,
                                  property.totalArea,
                                  property.numberOfBedrooms,
                                  property.numberOfBathrooms,
                                  property.nearbyLandmark,
                                  property.monthlyRent,
                                  property.currencyUnit,
                                  property.ownerID
                                )
                              }
                            >
                              Update
                            </button>
                            <button
                              className="properties-container__button properties-container__button--delete"
                              key={`${"db"}-${property.id}`}
                              onClick={() => confirmDeleteProperty(property.id)}
                            >
                              Delete
                            </button>
                          </Fragment>
                        ) : (
                          <Fragment>
                            <div className="properties-container__like-button-and-count">
                              {property.likedByUserIDs ? (
                                property.likedByUserIDs.includes(
                                  props.userID
                                ) ? (
                                  <button
                                    className="properties-container__button properties-container__button--already-liked"
                                    key={`${"alb"}-${property.id}`}
                                    onClick={() =>
                                      likeProperty(
                                        property.id,
                                        property.likeCount,
                                        property.likedByUserIDs
                                      )
                                    }
                                  >
                                    <i className="bi bi-hand-thumbs-up-fill"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="properties-container__button properties-container__button--like"
                                    key={`${"lb"}-${property.id}`}
                                    onClick={() =>
                                      likeProperty(
                                        property.id,
                                        property.likeCount,
                                        property.likedByUserIDs
                                      )
                                    }
                                  >
                                    <i className="bi bi-hand-thumbs-up"></i>
                                  </button>
                                )
                              ) : (
                                <button
                                  className="properties-container__button properties-container__button--like"
                                  key={`${"lb"}-${property.id}`}
                                  onClick={() =>
                                    likeProperty(
                                      property.id,
                                      property.likeCount,
                                      property.likedByUserIDs
                                    )
                                  }
                                >
                                  <i className="bi bi-hand-thumbs-up"></i>
                                </button>
                              )}
                              <p
                                className="properties-container__like-count"
                                key={`${"lc"}-${property.likeCount}`}
                              >
                                {property.likeCount ? property.likeCount : 0}
                              </p>
                            </div>
                            <button
                              className="properties-container__button properties-container__button--interested"
                              key={`${"ib"}-${property.id}`}
                              onClick={() =>
                                interestedInProperty(
                                  property.id,
                                  property.ownerID
                                )
                              }
                            >
                              I'm interested
                            </button>
                          </Fragment>
                        )}
                      </li>
                      {ownerDetails &&
                        property.id === selectedProperty.current && (
                          <li
                            className={`properties-container__owner-details ${
                              isAnimating
                                ? "properties-container__slide-out-animation"
                                : "properties-container__slide-in-animation"
                            }`}
                          >
                            <p className="properties-container__owner-details-heading">
                              Owner
                            </p>
                            <p className="properties-container__owner-details-item">
                              <span className="properties-container__owner-details-item-label">
                                Name
                              </span>
                              : {ownerDetails.fullName}
                            </p>
                            <p className="properties-container__owner-details-item">
                              <span className="properties-container__owner-details-item-label">
                                Email address
                              </span>
                              : {ownerDetails.emailAddress}
                            </p>
                            <p className="properties-container__owner-details-item">
                              <span className="properties-container__owner-details-item-label">
                                Phone number
                              </span>
                              : {ownerDetails.phoneNumber}
                            </p>
                            <button
                              className="properties-container__button properties-container__button--close-owner-details"
                              onClick={closeOwnerDetails}
                            >
                              Close
                            </button>
                          </li>
                        )}
                    </ul>
                  ))}
                </div>
              ))
            ) : countryFilter ||
              placeFilter ||
              minimumAreaFilter ||
              maximumAreaFilter ||
              numberOfBedroomsFilter ||
              numberOfBathroomsFilter ||
              nearbyLandmarkFilter ||
              minimumMonthlyRentFilter ||
              maximumMonthlyRentFilter ? (
              <h4 className="properties-container__no-properties-heading">
                No properties found with the applied filters
              </h4>
            ) : (
              <h4 className="properties-container__no-properties-heading">
                No properties available
              </h4>
            )}
          </div>
        )}
      </div>
      <div className="properties-container__pagination-container">
        {properties.length !== 0 && (
          <select
            defaultValue={10}
            className="properties-container__number-of-properties-selector"
            aria-label="Select number of properties"
            onChange={changePropertiesPerPage}
          >
            <option>Select number of properties per page</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        )}
        {properties.length !== 0 && (
          <Pagination
            currentPageNumber={currentPageNumber}
            totalNumberOfPages={totalNumberOfPages}
            paginate={paginate}
          />
        )}
      </div>
      {propertyToBeDeleted && (
        <Fragment>
          <div
            className="modal show"
            style={{ display: "block" }}
            tabIndex={-1}
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            role="dialog"
            aria-modal="true"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm deletion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setPropertyToBeDeleted("")}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to permanently delete this property?
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => setPropertyToBeDeleted("")}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteProperty(propertyToBeDeleted)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </Fragment>
      )}
    </div>
  );
}

export default Properties;
