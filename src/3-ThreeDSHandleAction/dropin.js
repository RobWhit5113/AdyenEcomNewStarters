// 0. Get clientKey
getClientKey().then((clientKey) => {
  getPaymentMethods().then(async (paymentMethodsResponse) => {
    
    const paypalConfiguration = {
      configuration: {
        merchantId: "2H3SV6643H24E",
        intent: "capture"
      },
    };

  
    //global config
    const configuration = {
      environment: "test",
      clientKey: clientKey, // Mandatory. clientKey from Customer Area
      paymentMethodsResponse,
      amount: '35123543',
      removePaymentMethods: ["paysafecard", "c_cash"],
      brandsConfiguration: {
        amex: {icon: 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/visa.svg'}
      },

      //comment out to break paypal config
      paymentMethodsConfiguration: {
        paypal: paypalConfiguration,
        // card: {
        //   hasHolderName: true,
        //   amount: 1000
        // },
      },
      
      onChange: (state, component) => {
        updateStateContainer(state); // Demo purposes only
      },

      onSubmit: (state, dropin) => {
        // console.log("state Data hererererere", state.data)
        makePayment(state.data)
          .then((response) => {
            dropin.setStatus("loading");
            if (response.action) {
              // console.log('onSubmit about to be handled with --', response)
              dropin.handleAction(response.action);
            } else if (response.resultCode === "Authorised") {
              dropin.setStatus("success", { message: "Payment successful!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            } else if (response.resultCode !== "Authorised") {
              dropin.setStatus("error", { message: "Oops, try again please!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            }
          })
          .catch((error) => {
            throw Error(error);
          });
      },

     onError: (e) => {
      console.log(e);
      dropin.setStatus("error", {message: "help im broken"})
      },

      //gets completed when the Identify shopper is completed and ChallengeShopper
      //triggered when a native action has occurred (native 3ds, paypal)

      onAdditionalDetails: (state, dropin) => {

        console.log("details is firing")
        // // console.log(JSON.stringify(state))
        submitDetails(state.data)
        // console.log("Below submitDetails", JSON.stringify(state.data.details))
          .then((response) => {
            if (response.action) {
              // console.log("there is an additional action returned from the first action", response.action)
              dropin.handleAction(response.action);
            } else if (response.resultCode === "Authorised") {
              dropin.setStatus("success", { message: "Payment successful!" });
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            } else if (response.resultCode !== "Authorised") {
              setTimeout(function () {
                dropin.setStatus("ready");
              }, 2000);
            }
          })
          .catch((error) => {
            throw Error(error);
          });
      },
    };
    // console.log(paymentMethodsResponse.paymentMethods[1].brands.pop());
    // 1. Create an instance of AdyenCheckout
    const checkout = await AdyenCheckout(configuration);

    // 2. Create and mount the Component
    const dropin = checkout
      .create("dropin", {
        // Events
        onSelect: (activeComponent) => {
          if (activeComponent.state && activeComponent.state.data)
            updateStateContainer(activeComponent.data); // Demo purposes only
        },
      })
      .mount("#dropin-container");
  });
});

// Redirect handling code starts here till the end

async function handleRedirectResult(redirectResult) {
  const checkout = await AdyenCheckout({
    environment: "test",
    clientKey: "test_M35ZRWIW6JHMPOLIAJELF2OYEYIKZQEP",
    locale: "en-GB",
  });
  const dropin = checkout
    .create("dropin", {
      setStatusAutomatically: false,
    })
    .mount("#dropin-container");

    // console.log('im redirect result', redirectResult);

  submitDetails({ details: { redirectResult } }).then((response) => {

    // console.log(response);

    if (response.resultCode === "Authorised") {
      document.getElementById("result-container").innerHTML =
        '<img alt="Success" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.svg">';
    } else if (response.resultCode !== "Authorised") {
      document.getElementById("result-container").innerHTML =
        '<img alt="Error" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.svg">';
    }
  });
}

const getSearchParameters = (search = window.location.search) =>
  search
    .replace(/\?/g, "")
    .split("&")
    .reduce((acc, cur) => {
      const [key, prop = ""] = cur.split("=");
      acc[key] = decodeURIComponent(prop);
      return acc;
    }, {});

const { redirectResult } = getSearchParameters(window.location.search);

if (redirectResult) {
  handleRedirectResult(redirectResult);
}
