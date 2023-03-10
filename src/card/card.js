// 0. Get clientKey
getClientKey().then(async clientKey => {

    // Optional, define custom placeholders for the Card fields
    // https://docs.adyen.com/online-payments/web-components/localization-components
    // const translations = {
    //     "en-GB": {
    //         "creditCard.numberField.placeholder": "1234 5678 9012 3456",
    //         "creditCard.expiryDateField.placeholder": "MM/YY",
    //     }
    // };

    // 1. Create an instance of AdyenCheckout
    const checkout = await AdyenCheckout({
        environment: 'test',
        locale: "en-GB",
        // Optional, define custom placeholders for the Card fields
        // https://docs.adyen.com/online-payments/web-components/localization-components
        // translations: translations,
        clientKey: clientKey // Mandatory. clientKey from Customer Area
    });

    // 2. Create and mount the Component
    const card = checkout
        .create('card', {
            // Optional Configuration
            // hasHolderName: true,

            // Optional. Customize the look and feel of the payment form
            // https://docs.adyen.com/developers/checkout/api-integration/configure-secured-fields/styling-secured-fields
            styles: {},
            brands: ["visa", "mc", "bcmc"],
            // enableStoreDetails: true,
            // hasHolderName: true,
            // billingAddressMode: true,
            // billingAddressRequired: true, 
            // installmentOptions: { card: { values: [2,3,4] } },

            // Optionally show a Pay Button
            showPayButton: true,

            // Events
            onSubmit: (state, dropin) => {
                makePayment(state.data)
                  .then((response) => {
                    dropin.setStatus("loading");
                    if (response.action) {
                      console.log('onSubmit about to be handled with --', response.action)
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

            onChange: (state, component) => {
                // state.data;
                // state.isValid;

                updateStateContainer(state); // Demo purposes only
            },
            onAdditionalDetails: (state, dropin) => {

                // console.log("above submitDetails", JSON.stringify(state.data.details))
                submitDetails(state.data)
                // console.log("Below submitDetails", JSON.stringify(state.data.details))
                  .then((response) => {
                    if (response.action) {
                      console.log("there is an additional action returned from the first action", response.action)
                      dropin.handleAction(response.action);
                    } else if (response.resultCode === "Authorised") {
                        console.log("success")
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
        })
        .mount('#card-container');
});