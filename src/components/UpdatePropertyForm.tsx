import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../dist/css/UpdatePropertyForm.css";

type PropertyFormAttributesType = {
  id: string;
  country: string;
  place: string;
  totalArea: number | string;
  numberOfBedrooms: number | string;
  numberOfBathrooms: number | string;
  nearbyLandmark: string;
  monthlyRent: number | string;
  currencyUnit: string;
  ownerID: string;
  likeCount: number | null;
  likedByUserIDs: string[] | null;
};

type PropertyUpdateAttributesType = {
  id: string | null;
  country: string | null;
  place: string | null;
  totalArea: number | string | null;
  numberOfBedrooms: number | string | null;
  numberOfBathrooms: number | string | null;
  nearbyLandmark: string | null;
  monthlyRent: number | string | null;
  currencyUnit: string | null;
  ownerID: string | null;
  likeCount: number | null;
  likedByUserIDs: string[] | null;
};

const propertyFormEmptyState: PropertyFormAttributesType = {
  id: "",
  country: "",
  place: "",
  totalArea: "",
  numberOfBedrooms: "",
  numberOfBathrooms: "",
  nearbyLandmark: "",
  monthlyRent: "",
  currencyUnit: "",
  ownerID: "",
  likeCount: null,
  likedByUserIDs: null,
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

function UpdatePropertyForm() {
  const { setPropertyUpdated, propertyFormInitialValues } = useOutletContext<{
    setPropertyUpdated: React.Dispatch<React.SetStateAction<boolean>>;
    propertyFormInitialValues: PropertyFormAttributesType;
  }>();

  const [propertyFormState, setPropertyFormState] = useState(
    propertyFormInitialValues
  );

  const navigate = useNavigate();

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (
      event.target.name === "totalArea" ||
      event.target.name === "monthlyRent"
    ) {
      if (event.target.value === "") {
        setPropertyFormState((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: event.target.value,
        }));
      } else {
        setPropertyFormState((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: Math.abs(parseFloat(event.target.value)),
        }));
      }
    } else if (
      event.target.name === "numberOfBedrooms" ||
      event.target.name === "numberOfBathrooms"
    ) {
      if (event.target.value === "") {
        setPropertyFormState((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: event.target.value,
        }));
      } else {
        setPropertyFormState((prevFormData) => ({
          ...prevFormData,
          [event.target.name]: Math.abs(parseInt(event.target.value)),
        }));
      }
    } else if (
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
  const [totalAreaInputStatus, dispatchTotalAreaInputStatus] = useReducer(
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
    dispatchTotalAreaInputStatus({
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

  const updateProperty = async () => {
    try {
      setLoadingIconState(true);
      const updatedPropertyDetails: PropertyUpdateAttributesType = {
        id: propertyFormState.id,
        country: propertyFormState.country,
        place: propertyFormState.place,
        totalArea: propertyFormState.totalArea,
        numberOfBedrooms: propertyFormState.numberOfBedrooms,
        numberOfBathrooms: propertyFormState.numberOfBathrooms,
        nearbyLandmark: propertyFormState.nearbyLandmark,
        monthlyRent: propertyFormState.monthlyRent,
        currencyUnit: propertyFormState.currencyUnit,
        ownerID: propertyFormState.ownerID,
        likeCount: null,
        likedByUserIDs: null,
      };
      Object.keys(updatedPropertyDetails).forEach((key) => {
        if (
          updatedPropertyDetails[key as keyof PropertyUpdateAttributesType] ===
            propertyFormInitialValues[
              key as keyof PropertyUpdateAttributesType
            ] &&
          key !== "id"
        )
          updatedPropertyDetails[key as keyof PropertyUpdateAttributesType] =
            null;
      });
      const serverResponse = await axios.patch(
        "http://localhost:3050/api/properties/update",
        JSON.stringify(updatedPropertyDetails),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (
        serverResponse.data.message === "Updated" &&
        serverResponse.data.propertyID
      ) {
        setPropertyUpdated(true);
        toast.success("Successfully updated selected property");
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

  function checkForEmptyInputFields(firstObject: Object, secondObject: Object) {
    const firstObjectKeys = Object.keys(firstObject);
    for (const key of firstObjectKeys) {
      if (
        typeof firstObject[key as keyof typeof firstObject] === "string" &&
        firstObject[key as keyof typeof firstObject] ===
          secondObject[key as keyof typeof secondObject]
      )
        return true;
    }
    return false;
  }

  const isAnyInputFieldEmpty = checkForEmptyInputFields(
    propertyFormState,
    propertyFormEmptyState
  );
  const isAnyInputFieldInvalid =
    !countryRegEx.test(propertyFormState.country) ||
    !placeRegEx.test(propertyFormState.place) ||
    !totalAreaRegEx.test(`${propertyFormState.totalArea}`) ||
    !numberOfBedroomsRegEx.test(`${propertyFormState.numberOfBedrooms}`) ||
    !numberOfBathroomsRegEx.test(`${propertyFormState.numberOfBathrooms}`) ||
    !nearbyLandmarkRegEx.test(propertyFormState.nearbyLandmark) ||
    !monthlyRentRegEx.test(`${propertyFormState.monthlyRent}`) ||
    !currencyUnitRegEx.test(propertyFormState.currencyUnit);
  const isAnyInputFieldValueDifferent =
    propertyFormState.country !== propertyFormInitialValues.country ||
    propertyFormState.place !== propertyFormInitialValues.place ||
    propertyFormState.totalArea !== propertyFormInitialValues.totalArea ||
    propertyFormState.numberOfBedrooms !==
      propertyFormInitialValues.numberOfBedrooms ||
    propertyFormState.numberOfBathrooms !==
      propertyFormInitialValues.numberOfBathrooms ||
    propertyFormState.nearbyLandmark !==
      propertyFormInitialValues.nearbyLandmark ||
    propertyFormState.monthlyRent !== propertyFormInitialValues.monthlyRent ||
    propertyFormState.currencyUnit !== propertyFormInitialValues.currencyUnit;

  useEffect(() => {
    isSubmitButtonDisabled.current =
      !isAnyInputFieldValueDifferent ||
      isAnyInputFieldInvalid ||
      isAnyInputFieldEmpty;
  }, [propertyFormState]);

  const closePropertyForm = () => {
    navigate("..");
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProperty();
  };

  return (
    <Fragment>
      <form
        className="update-property-form"
        onSubmit={handleSubmit}
        method="POST"
        action=""
      >
        <h3 className="update-property-form__heading">
          Update property details
        </h3>
        <svg
          className="update-property-form__button--close-form"
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
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.propertyError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__country"
            className={`update-property-form__country ${
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
            aria-describedby="update-property-form__country-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__country"
          >
            Enter country in which the property is located
          </label>
        </div>
        {propertyFormState.country &&
          countryInputStatus.focused &&
          !countryInputStatus.valid && (
            <p
              id="update-property-form__country-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.countryInstructions)}
            </p>
          )}
        {errorMessage.countryError && (
          <p
            ref={countryErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.countryError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__place"
            className={`update-property-form__place ${
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
            aria-describedby="update-property-form__place-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__place"
          >
            Enter place in which the property is located
          </label>
        </div>
        {propertyFormState.place &&
          placeInputStatus.focused &&
          !placeInputStatus.valid && (
            <p
              id="update-property-form__place-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.placeInstructions)}
            </p>
          )}
        {errorMessage.placeError && (
          <p
            ref={placeErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.placeError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__total-area"
            className={`update-property-form__total-area ${
              propertyFormState.totalArea !== ""
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
              dispatchTotalAreaInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchTotalAreaInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={totalAreaInputStatus.valid ? "false" : "true"}
            aria-describedby="update-property-form__total-area-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__total-area"
          >
            Enter total area of the property (in sq. ft.)
          </label>
        </div>
        {typeof propertyFormState.totalArea === "number" &&
          totalAreaInputStatus.focused &&
          !totalAreaInputStatus.valid && (
            <p
              id="update-property-form__total-area-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.totalAreaInstructions)}
            </p>
          )}
        {errorMessage.totalAreaError && (
          <p
            ref={totalAreaErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.totalAreaError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__number-of-bedrooms"
            className={`update-property-form__number-of-bedrooms ${
              propertyFormState.numberOfBedrooms !== ""
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
            aria-describedby="update-property-form__number-of-bedrooms-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__number-of-bedrooms"
          >
            Enter number of bedrooms
          </label>
        </div>
        {typeof propertyFormState.numberOfBedrooms === "number" &&
          numberOfBedroomsInputStatus.focused &&
          !numberOfBedroomsInputStatus.valid && (
            <p
              id="update-property-form__number-of-bedrooms-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.numberOfBedroomsInstructions)}
            </p>
          )}
        {errorMessage.numberOfBedroomsError && (
          <p
            ref={numberOfBedroomsErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.numberOfBedroomsError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__number-of-bathrooms"
            className={`update-property-form__number-of-bathrooms ${
              propertyFormState.numberOfBathrooms !== ""
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
            aria-describedby="update-property-form__number-of-bathrooms-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__number-of-bathrooms"
          >
            Enter number of bathrooms
          </label>
        </div>
        {typeof propertyFormState.numberOfBathrooms === "number" &&
          numberOfBathroomsInputStatus.focused &&
          !numberOfBathroomsInputStatus.valid && (
            <p
              id="update-property-form__number-of-bathrooms-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.numberOfBathroomsInstructions)}
            </p>
          )}
        {errorMessage.numberOfBathroomsError && (
          <p
            ref={numberOfBathroomsErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.numberOfBathroomsError}
          </p>
        )}
        <div className="update-property-form__floating-label-group">
          <input
            id="update-property-form__nearby-landmark"
            className={`update-property-form__nearby-landmark ${
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
            aria-describedby="update-property-form__nearby-landmark-requirements"
          />
          <label
            lang="en"
            className="update-property-form__floating-label"
            htmlFor="update-property-form__nearby-landmark"
          >
            Enter nearby landmark
          </label>
        </div>
        {propertyFormState.nearbyLandmark &&
          nearbyLandmarkInputStatus.focused &&
          !nearbyLandmarkInputStatus.valid && (
            <p
              id="update-property-form__nearby-landmark-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.nearbyLandmarkInstructions)}
            </p>
          )}
        {errorMessage.nearbyLandmarkError && (
          <p
            ref={nearbyLandmarkErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.nearbyLandmarkError}
          </p>
        )}
        <div className="update-property-form__rent-and-currency-unit-group">
          <div className="update-property-form__rent-label-group">
            <input
              id="update-property-form__monthly-rent"
              className={`update-property-form__monthly-rent ${
                propertyFormState.monthlyRent !== ""
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
              aria-describedby="update-property-form__monthly-rent-requirements"
            />
            <label
              lang="en"
              className="update-property-form__floating-label"
              htmlFor="update-property-form__monthly-rent"
            >
              Enter rent for one month
            </label>
          </div>
          <div className="update-property-form__label-group">
            <label
              lang="en"
              className="update-property-form__label"
              htmlFor="update-property-form__currency-unit"
            >
              Choose currency unit:{" "}
            </label>
            <select
              id="update-property-form__currency-unit"
              className={`update-property-form__currency-unit ${
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
              aria-describedby="update-property-form__currency-unit-requirements"
            >
              <option value="">Select an unit</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        {typeof propertyFormState.monthlyRent === "number" &&
          monthlyRentInputStatus.focused &&
          !monthlyRentInputStatus.valid && (
            <p
              id="update-property-form__monthly-rent-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.monthlyRentInstructions)}
            </p>
          )}
        {errorMessage.monthlyRentError && (
          <p
            ref={monthlyRentErrorRef}
            className="update-property-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.monthlyRentError}
          </p>
        )}
        {propertyFormState.currencyUnit &&
          currencyUnitInputStatus.focused &&
          !currencyUnitInputStatus.valid && (
            <p
              id="update-property-form__currency-unit-requirements"
              className="update-property-form__show-instructions"
            >
              {parse(inputInstructions.currencyUnitInstructions)}
            </p>
          )}
        {errorMessage.currencyUnitError && (
          <p
            ref={currencyUnitErrorRef}
            className="update-property-form__show-error"
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
          className={`update-property-form__button--submit ${
            isSubmitButtonDisabled.current ? "button-disabled" : ""
          }`}
          lang="en"
          name="update"
          type="submit"
          disabled={isSubmitButtonDisabled.current ? true : false}
        >
          <i></i>UPDATE
        </button>
      </form>
    </Fragment>
  );
}

export default UpdatePropertyForm;
