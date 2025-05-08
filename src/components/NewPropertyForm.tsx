import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../dist/css/NewPropertyForm.css";

type PropertyFormAttributesType = {
  country: string;
  place: string;
  totalArea: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  nearbyLandmark: string;
  monthlyRent: number;
  currencyUnit: string;
  ownerID: string;
};

const propertyFormEmptyState: PropertyFormAttributesType = {
  country: "",
  place: "",
  totalArea: NaN,
  numberOfBedrooms: NaN,
  numberOfBathrooms: NaN,
  nearbyLandmark: "",
  monthlyRent: NaN,
  currencyUnit: "",
  ownerID: "",
};

type PropertyFormInputStatusType = {
  valid: boolean;
  focused: boolean;
};

type PropertyFormInputActionType = {
  type: string;
  payload: boolean;
};

const propertyFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: PropertyFormInputStatusType,
  action: PropertyFormInputActionType
) => {
  switch (action.type) {
    case "focus":
      return { ...state, focused: action.payload };
    case "valid":
      return { ...state, valid: action.payload };
    default:
      throw new Error();
  }
};

type PropertyFormErrorsType = {
  countryError: string;
  placeError: string;
  totalAreaError: string;
  numberOfBedroomsError: string;
  numberOfBathroomsError: string;
  nearbyLandmarkError: string;
  monthlyRentError: string;
  currencyUnitError: string;
  propertyError: string;
};

type PropertyFormErrorsActionType = {
  type: string;
  payload: string;
};

const propertyFormErrorsInitialState = {
  countryError: "",
  placeError: "",
  totalAreaError: "",
  numberOfBedroomsError: "",
  numberOfBathroomsError: "",
  nearbyLandmarkError: "",
  monthlyRentError: "",
  currencyUnitError: "",
  propertyError: "",
};

const errorReducer = (
  state: PropertyFormErrorsType,
  action: PropertyFormErrorsActionType
) => {
  switch (action.type) {
    case "country":
      return { ...state, countryError: action.payload };
    case "place":
      return { ...state, placeError: action.payload };
    case "totalArea":
      return { ...state, totalAreaError: action.payload };
    case "numberOfBedrooms":
      return { ...state, numberOfBedroomsError: action.payload };
    case "numberOfBathrooms":
      return { ...state, numberOfBathroomsError: action.payload };
    case "nearbyLandmark":
      return { ...state, nearbyLandmarkError: action.payload };
    case "monthlyRent":
      return { ...state, monthlyRentError: action.payload };
    case "currencyUnit":
      return { ...state, currencyUnitError: action.payload };
    case "property":
      return { ...state, propertyError: action.payload };
    default:
      throw new Error();
  }
};

const inputInstructions = {
  countryInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 100 characters<br />Letters and some special characters allowed',
  placeInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 200 characters<br />Letters and some special characters allowed',
  totalAreaInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain 2 to 10 digits<br />Only digits allowed',
  numberOfBedroomsInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain 2 to 4 digits<br />Only digits allowed',
  numberOfBathroomsInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain 2 to 4 digits<br />Only digits allowed',
  nearbyLandmarkInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 200 characters<br />Letters and some special characters allowed',
  monthlyRentInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain 2 to 10 digits<br />Only digits allowed',
  currencyUnitInstructions:
    '<i className="bi bi-info-circle-fill"></i> Currently allowed currencies: INR, EUR, USD',
};

function NewPropertyForm() {
  const { setNewPropertyAdded } = useOutletContext<{
    setNewPropertyAdded: React.Dispatch<React.SetStateAction<boolean>>;
  }>();
  const [propertyFormState, setPropertyFormState] = useState(
    propertyFormEmptyState
  );

  const navigate = useNavigate();

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (
      event.target.name === "totalArea" ||
      event.target.name === "monthlyRent"
    )
      setPropertyFormState((prevFormData) => ({
        ...prevFormData,
        [event.target.name]: Math.abs(parseFloat(event.target.value)),
      }));
    else if (
      event.target.name === "numberOfBedrooms" ||
      event.target.name === "numberOfBathrooms"
    )
      setPropertyFormState((prevFormData) => ({
        ...prevFormData,
        [event.target.name]: Math.abs(parseInt(event.target.value)),
      }));
    else if (
      event.target.name === "country" ||
      event.target.name === "place" ||
      event.target.name === "nearbyLandmark" ||
      event.target.name === "currencyUnit"
    )
      setPropertyFormState((prevFormData) => ({
        ...prevFormData,
        [event.target.name]: event.target.value,
      }));
  };

  const [loadingIconState, setLoadingIconState] = useState(false);

  const countryInputRef = useRef<HTMLInputElement | null>(null);

  const countryErrorRef = useRef<HTMLParagraphElement | null>(null);
  const placeErrorRef = useRef<HTMLParagraphElement | null>(null);
  const totalAreaErrorRef = useRef<HTMLParagraphElement | null>(null);
  const numberOfBedroomsErrorRef = useRef<HTMLParagraphElement | null>(null);
  const numberOfBathroomsErrorRef = useRef<HTMLParagraphElement | null>(null);
  const nearbyLandmarkErrorRef = useRef<HTMLParagraphElement | null>(null);
  const monthlyRentErrorRef = useRef<HTMLParagraphElement | null>(null);
  const currencyUnitErrorRef = useRef<HTMLParagraphElement | null>(null);
  const propertyErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [countryInputStatus, dispatchCountryInputStatus] = useReducer(
    inputStatusReducer,
    propertyFormInputStatusInitialState
  );
  const [placeInputStatus, dispatchPlaceInputStatus] = useReducer(
    inputStatusReducer,
    propertyFormInputStatusInitialState
  );
  const [totalAreaInputStatus, dispatchAreaInputStatus] = useReducer(
    inputStatusReducer,
    propertyFormInputStatusInitialState
  );
  const [numberOfBedroomsInputStatus, dispatchNumberOfBedroomsInputStatus] =
    useReducer(inputStatusReducer, propertyFormInputStatusInitialState);
  const [numberOfBathroomsInputStatus, dispatchNumberOfBathroomsInputStatus] =
    useReducer(inputStatusReducer, propertyFormInputStatusInitialState);
  const [nearbyLandmarkInputStatus, dispatchNearbyLandmarkInputStatus] =
    useReducer(inputStatusReducer, propertyFormInputStatusInitialState);
  const [monthlyRentInputStatus, dispatchMonthlyRentInputStatus] = useReducer(
    inputStatusReducer,
    propertyFormInputStatusInitialState
  );
  const [currencyUnitInputStatus, dispatchCurrencyUnitInputStatus] = useReducer(
    inputStatusReducer,
    propertyFormInputStatusInitialState
  );
  const [errorMessage, dispatchErrorMessage] = useReducer(
    errorReducer,
    propertyFormErrorsInitialState
  );

  useEffect(() => {
    countryInputRef.current?.focus();
  }, []);

  const isSubmitButtonDisabled = useRef(true);

  const countryRegEx = /^(?=.{2,})[A-Za-z\s\.\-]+$/;
  const placeRegEx = /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
  const totalAreaRegEx = /^([1-9][0-9]*(?:\.[0-9]{1,2})?|[0]\.[0-9]{1,2})$/;
  const numberOfBedroomsRegEx = /^[1-9][0-9]*$/;
  const numberOfBathroomsRegEx = /^[1-9][0-9]*$/;
  const nearbyLandmarkRegEx =
    /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
  const monthlyRentRegEx = /^([1-9][0-9]*(?:\.[0-9]{1,2})?|[0]\.[0-9]{1,2})$/;
  const currencyUnitRegEx = /^(INR|EUR|USD|inr|eur|usd)$/;

  useEffect(() => {
    const countryValidationResult = countryRegEx.test(
      propertyFormState.country
    );
    dispatchCountryInputStatus({
      type: "valid",
      payload: countryValidationResult,
    });
  }, [propertyFormState.country]);

  useEffect(() => {
    const placeValidationResult = placeRegEx.test(propertyFormState.place);
    dispatchPlaceInputStatus({ type: "valid", payload: placeValidationResult });
  }, [propertyFormState.place]);

  useEffect(() => {
    const totalAreaValidationResult = totalAreaRegEx.test(
      `${propertyFormState.totalArea}`
    );
    dispatchAreaInputStatus({
      type: "valid",
      payload: totalAreaValidationResult,
    });
  }, [propertyFormState.totalArea]);

  useEffect(() => {
    const numberOfBedroomsValidationResult = numberOfBedroomsRegEx.test(
      `${propertyFormState.numberOfBedrooms}`
    );
    dispatchNumberOfBedroomsInputStatus({
      type: "valid",
      payload: numberOfBedroomsValidationResult,
    });
  }, [propertyFormState.numberOfBedrooms]);

  useEffect(() => {
    const numberOfBathroomsValidationResult = numberOfBathroomsRegEx.test(
      `${propertyFormState.numberOfBathrooms}`
    );
    dispatchNumberOfBathroomsInputStatus({
      type: "valid",
      payload: numberOfBathroomsValidationResult,
    });
  }, [propertyFormState.numberOfBathrooms]);

  useEffect(() => {
    const nearbyLandmarkValidationResult = nearbyLandmarkRegEx.test(
      propertyFormState.nearbyLandmark
    );
    dispatchNearbyLandmarkInputStatus({
      type: "valid",
      payload: nearbyLandmarkValidationResult,
    });
  }, [propertyFormState.nearbyLandmark]);

  useEffect(() => {
    const monthlyRentValidationResult = monthlyRentRegEx.test(
      `${propertyFormState.monthlyRent}`
    );
    dispatchMonthlyRentInputStatus({
      type: "valid",
      payload: monthlyRentValidationResult,
    });
  }, [propertyFormState.monthlyRent]);

  useEffect(() => {
    const currencyUnitValidationResult = currencyUnitRegEx.test(
      propertyFormState.currencyUnit
    );
    dispatchCurrencyUnitInputStatus({
      type: "valid",
      payload: currencyUnitValidationResult,
    });
  }, [propertyFormState.currencyUnit]);

  useEffect(() => {
    dispatchErrorMessage({ type: "country", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.country]);

  useEffect(() => {
    dispatchErrorMessage({ type: "place", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.place]);

  useEffect(() => {
    dispatchErrorMessage({ type: "totalArea", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.totalArea]);

  useEffect(() => {
    dispatchErrorMessage({ type: "numberOfBedrooms", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.numberOfBedrooms]);

  useEffect(() => {
    dispatchErrorMessage({ type: "numberOfBathrooms", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.numberOfBathrooms]);

  useEffect(() => {
    dispatchErrorMessage({ type: "nearbyLandmark", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.nearbyLandmark]);

  useEffect(() => {
    dispatchErrorMessage({ type: "monthlyRent", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.monthlyRent]);

  useEffect(() => {
    dispatchErrorMessage({ type: "currencyUnit", payload: "" });
    dispatchErrorMessage({ type: "property", payload: "" });
  }, [propertyFormState.currencyUnit]);

  const addNewProperty = async () => {
    try {
      const serverResponse = await axios.post(
        "http://localhost:3050/api/properties/new",
        JSON.stringify(propertyFormState),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (
        serverResponse.data.message === "Added" &&
        serverResponse.data.propertyID
      ) {
        setNewPropertyAdded(true);
        toast.success("Successfully added new property");
        dispatchErrorMessage({ type: "property", payload: "" });
        setLoadingIconState(false);
        setPropertyFormState(propertyFormEmptyState);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          dispatchErrorMessage({ type: "property", payload: errorMessage });
          setLoadingIconState(false);
        }
      }
      propertyErrorRef.current?.focus();
    }
  };

  const isAnyInputFieldInvalid =
    !countryRegEx.test(propertyFormState.country) ||
    !placeRegEx.test(propertyFormState.place) ||
    !totalAreaRegEx.test(`${propertyFormState.totalArea}`) ||
    !numberOfBedroomsRegEx.test(`${propertyFormState.numberOfBedrooms}`) ||
    !numberOfBathroomsRegEx.test(`${propertyFormState.numberOfBathrooms}`) ||
    !nearbyLandmarkRegEx.test(propertyFormState.nearbyLandmark) ||
    !monthlyRentRegEx.test(`${propertyFormState.monthlyRent}`) ||
    !currencyUnitRegEx.test(propertyFormState.currencyUnit);

  useEffect(() => {
    isSubmitButtonDisabled.current = isAnyInputFieldInvalid;
  }, [propertyFormState]);

  useEffect(() => {
    if (propertyFormState.ownerID !== "") addNewProperty();
  }, [propertyFormState.ownerID]);

  const closePropertyForm = () => {
    navigate("..");
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoadingIconState(true);
      const response = await axios.get(
        "http://localhost:3050/api/users/getID",
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.token,
          },
          withCredentials: true,
        }
      );
      if (response.data.userID) {
        setPropertyFormState((prevFormData) => ({
          ...prevFormData,
          ownerID: response.data.userID,
        }));
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          dispatchErrorMessage({ type: "property", payload: errorMessage });
          setLoadingIconState(false);
        }
      }
      propertyErrorRef.current?.focus();
    }
  };

  return (
    <Fragment>
      <form
        className="new-property-form"
        onSubmit={handleSubmit}
        method="POST"
        action=""
      >
        <h3 className="new-property-form__heading">Add new property</h3>
        <svg
          className="new-property-form__button--close-form"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 20 20"
          xmlSpace="preserve"
          onClick={closePropertyForm}
        >
          <path d="M2,2 18,18 M18,2 2,18" stroke="#323232" strokeWidth={2} />
        </svg>
        {errorMessage.propertyError && (
          <p
            ref={propertyErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.propertyError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__country"
            className={`new-property-form__country ${
              propertyFormState.country !== ""
                ? countryInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="country"
            type="text"
            maxLength={100}
            ref={countryInputRef}
            value={propertyFormState.country}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchCountryInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchCountryInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={countryInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__country-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__country"
          >
            Enter country in which the property is located
          </label>
        </div>
        {propertyFormState.country &&
          countryInputStatus.focused &&
          !countryInputStatus.valid && (
            <p
              id="new-property-form__country-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.countryInstructions)}
            </p>
          )}
        {errorMessage.countryError && (
          <p
            ref={countryErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.countryError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__place"
            className={`new-property-form__place ${
              propertyFormState.place !== ""
                ? placeInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="place"
            type="text"
            maxLength={200}
            value={propertyFormState.place}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchPlaceInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchPlaceInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={placeInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__place-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__place"
          >
            Enter place in which the property is located
          </label>
        </div>
        {propertyFormState.place &&
          placeInputStatus.focused &&
          !placeInputStatus.valid && (
            <p
              id="new-property-form__place-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.placeInstructions)}
            </p>
          )}
        {errorMessage.placeError && (
          <p
            ref={placeErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.placeError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__total-area"
            className={`new-property-form__total-area ${
              !Number.isNaN(propertyFormState.totalArea)
                ? totalAreaInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="totalArea"
            type="number"
            step={0.01}
            value={propertyFormState.totalArea}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchAreaInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchAreaInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={totalAreaInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__total-area-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__total-area"
          >
            Enter total area of the property (in sq. ft.)
          </label>
        </div>
        {!isNaN(propertyFormState.totalArea) &&
          totalAreaInputStatus.focused &&
          !totalAreaInputStatus.valid && (
            <p
              id="new-property-form__total-area-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.totalAreaInstructions)}
            </p>
          )}
        {errorMessage.totalAreaError && (
          <p
            ref={totalAreaErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.totalAreaError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__number-of-bedrooms"
            className={`new-property-form__number-of-bedrooms ${
              !Number.isNaN(propertyFormState.numberOfBedrooms)
                ? numberOfBedroomsInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="numberOfBedrooms"
            type="number"
            value={propertyFormState.numberOfBedrooms}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchNumberOfBedroomsInputStatus({
                type: "focus",
                payload: true,
              })
            }
            onBlur={() =>
              dispatchNumberOfBedroomsInputStatus({
                type: "focus",
                payload: false,
              })
            }
            required={true}
            autoComplete="off"
            aria-invalid={numberOfBedroomsInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__number-of-bedrooms-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__number-of-bedrooms"
          >
            Enter number of bedrooms
          </label>
        </div>
        {!isNaN(propertyFormState.numberOfBedrooms) &&
          numberOfBedroomsInputStatus.focused &&
          !numberOfBedroomsInputStatus.valid && (
            <p
              id="new-property-form__number-of-bedrooms-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.numberOfBedroomsInstructions)}
            </p>
          )}
        {errorMessage.numberOfBedroomsError && (
          <p
            ref={numberOfBedroomsErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.numberOfBedroomsError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__number-of-bathrooms"
            className={`new-property-form__number-of-bathrooms ${
              !Number.isNaN(propertyFormState.numberOfBathrooms)
                ? numberOfBathroomsInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="numberOfBathrooms"
            type="number"
            value={propertyFormState.numberOfBathrooms}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchNumberOfBathroomsInputStatus({
                type: "focus",
                payload: true,
              })
            }
            onBlur={() =>
              dispatchNumberOfBathroomsInputStatus({
                type: "focus",
                payload: false,
              })
            }
            required={true}
            autoComplete="off"
            aria-invalid={numberOfBathroomsInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__number-of-bathrooms-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__number-of-bathrooms"
          >
            Enter number of bathrooms
          </label>
        </div>
        {!isNaN(propertyFormState.numberOfBathrooms) &&
          numberOfBathroomsInputStatus.focused &&
          !numberOfBathroomsInputStatus.valid && (
            <p
              id="new-property-form__number-of-bathrooms-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.numberOfBathroomsInstructions)}
            </p>
          )}
        {errorMessage.numberOfBathroomsError && (
          <p
            ref={numberOfBathroomsErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.numberOfBathroomsError}
          </p>
        )}
        <div className="new-property-form__floating-label-group">
          <input
            id="new-property-form__nearby-landmark"
            className={`new-property-form__nearby-landmark ${
              propertyFormState.nearbyLandmark !== ""
                ? nearbyLandmarkInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="nearbyLandmark"
            type="text"
            maxLength={200}
            value={propertyFormState.nearbyLandmark}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchNearbyLandmarkInputStatus({
                type: "focus",
                payload: true,
              })
            }
            onBlur={() =>
              dispatchNearbyLandmarkInputStatus({
                type: "focus",
                payload: false,
              })
            }
            required={true}
            autoComplete="off"
            aria-invalid={nearbyLandmarkInputStatus.valid ? "false" : "true"}
            aria-describedby="new-property-form__nearby-landmark-requirements"
          />
          <label
            lang="en"
            className="new-property-form__floating-label"
            htmlFor="new-property-form__nearby-landmark"
          >
            Enter nearby landmark
          </label>
        </div>
        {propertyFormState.nearbyLandmark &&
          nearbyLandmarkInputStatus.focused &&
          !nearbyLandmarkInputStatus.valid && (
            <p
              id="new-property-form__nearby-landmark-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.nearbyLandmarkInstructions)}
            </p>
          )}
        {errorMessage.nearbyLandmarkError && (
          <p
            ref={nearbyLandmarkErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.nearbyLandmarkError}
          </p>
        )}
        <div className="new-property-form__rent-and-currency-unit-group">
          <div className="new-property-form__rent-label-group">
            <input
              id="new-property-form__monthly-rent"
              className={`new-property-form__monthly-rent ${
                !Number.isNaN(propertyFormState.monthlyRent)
                  ? monthlyRentInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="monthlyRent"
              type="number"
              step={0.01}
              value={propertyFormState.monthlyRent}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchMonthlyRentInputStatus({ type: "focus", payload: true })
              }
              onBlur={() =>
                dispatchMonthlyRentInputStatus({
                  type: "focus",
                  payload: false,
                })
              }
              required={true}
              autoComplete="off"
              aria-invalid={monthlyRentInputStatus.valid ? "false" : "true"}
              aria-describedby="new-property-form__monthly-rent-requirements"
            />
            <label
              lang="en"
              className="new-property-form__floating-label"
              htmlFor="new-property-form__monthly-rent"
            >
              Enter rent for one month
            </label>
          </div>
          <div className="new-property-form__label-group">
            <label
              lang="en"
              className="new-property-form__label"
              htmlFor="new-property-form__currency-unit"
            >
              Choose currency unit:{" "}
            </label>
            <select
              id="new-property-form__currency-unit"
              className={`new-property-form__currency-unit ${
                propertyFormState.currencyUnit !== ""
                  ? currencyUnitInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="currencyUnit"
              value={propertyFormState.currencyUnit}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchCurrencyUnitInputStatus({
                  type: "focus",
                  payload: true,
                })
              }
              onBlur={() =>
                dispatchCurrencyUnitInputStatus({
                  type: "focus",
                  payload: false,
                })
              }
              required={true}
              autoComplete="off"
              aria-invalid={currencyUnitInputStatus.valid ? "false" : "true"}
              aria-describedby="new-property-form__currency-unit-requirements"
            >
              <option value="">Select an unit</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        {!isNaN(propertyFormState.monthlyRent) &&
          monthlyRentInputStatus.focused &&
          !monthlyRentInputStatus.valid && (
            <p
              id="new-property-form__monthly-rent-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.monthlyRentInstructions)}
            </p>
          )}
        {errorMessage.monthlyRentError && (
          <p
            ref={monthlyRentErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.monthlyRentError}
          </p>
        )}
        {propertyFormState.currencyUnit &&
          currencyUnitInputStatus.focused &&
          !currencyUnitInputStatus.valid && (
            <p
              id="new-property-form__currency-unit-requirements"
              className="new-property-form__show-instructions"
            >
              {parse(inputInstructions.currencyUnitInstructions)}
            </p>
          )}
        {errorMessage.currencyUnitError && (
          <p
            ref={currencyUnitErrorRef}
            className="new-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.currencyUnitError}
          </p>
        )}
        {loadingIconState && (
          <div className="d-flex justify-content-center">
            <div
              className="spinner-border"
              style={{ width: "2rem", height: "2rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <button
          className={`new-property-form__button--submit ${
            isSubmitButtonDisabled.current ? "button-disabled" : ""
          }`}
          lang="en"
          name="add"
          type="submit"
          disabled={isSubmitButtonDisabled.current ? true : false}
        >
          <i></i>ADD
        </button>
      </form>
    </Fragment>
  );
}

export default NewPropertyForm;
