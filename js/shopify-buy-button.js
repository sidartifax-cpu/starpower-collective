(() => {
  const component = document.querySelector("#product-component-1794262256692");
  const status = document.querySelector("#shopify-status");
  if (!component || !status) return;

  const scriptUrl =
    "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";

  function showLoadError(error) {
    console.error("Shopify Buy Button could not be loaded:", error);
    status.textContent =
      "The secure checkout button could not load. Please try again later.";
  }

  function initializeShopifyBuyButton() {
    const shopifyBuy = window.ShopifyBuy;
    if (!shopifyBuy?.UI) {
      showLoadError(new Error("Shopify Buy Button UI is unavailable."));
      return;
    }

    const client = shopifyBuy.buildClient({
      domain: "moor-than-graphix.myshopify.com",
      storefrontAccessToken: "b2a55cac0fb81e9762905e09a0d44029"
    });

    shopifyBuy.UI.onReady(client)
      .then(ui => {
        const observer = new MutationObserver(() => {
          if (component.querySelector("iframe, .shopify-buy-frame")) {
            component.closest(".shop-card")?.classList.add("shopify-buy-loaded");
            status.hidden = true;
            observer.disconnect();
          }
        });
        observer.observe(component, { childList: true, subtree: true });

        try {
          ui.createComponent("product", {
            id: "4454981926974",
            node: component,
            moneyFormat: "%24%7B%7Bamount%7D%7D",
            options: {
            product: {
              styles: {
                product: {
                  "@media (min-width: 601px)": {
                    "max-width": "100%",
                    "margin-left": "0",
                    "margin-bottom": "0"
                  }
                },
                title: {
                  "font-family": "Inter, sans-serif",
                  "font-size": "22px",
                  color: "#f5f0e8"
                },
                price: {
                  color: "#f5e400",
                  "font-size": "18px"
                },
                button: {
                  "font-family": "Inter, sans-serif",
                  "font-size": "14px",
                  "font-weight": "700",
                  "padding-top": "14px",
                  "padding-bottom": "14px",
                  color: "#11172c",
                  "background-color": "#f5e400",
                  "border-radius": "2px",
                  ":hover": {
                    "background-color": "#ffffff"
                  },
                  ":focus": {
                    "background-color": "#ffffff"
                  }
                },
                quantityInput: {
                  "font-family": "Inter, sans-serif",
                  "font-size": "14px"
                }
              },
              text: {
                button: "Add to cart"
              }
            },
            modalProduct: {
              contents: {
                img: false,
                imgWithCarousel: true,
                button: false,
                buttonWithQuantity: true
              },
              styles: {
                button: {
                  "font-family": "Inter, sans-serif",
                  "font-size": "14px",
                  "font-weight": "700",
                  "padding-top": "14px",
                  "padding-bottom": "14px",
                  color: "#11172c",
                  "background-color": "#f5e400",
                  "border-radius": "2px",
                  ":hover": {
                    "background-color": "#ffffff"
                  },
                  ":focus": {
                    "background-color": "#ffffff"
                  }
                }
              }
            },
            cart: {
              styles: {
                button: {
                  "font-family": "Inter, sans-serif",
                  "font-size": "14px",
                  "font-weight": "700",
                  "padding-top": "14px",
                  "padding-bottom": "14px",
                  color: "#11172c",
                  "background-color": "#f5e400",
                  "border-radius": "2px"
                }
              }
            },
            toggle: {
              styles: {
                toggle: {
                  "background-color": "#f5e400"
                },
                count: {
                  color: "#11172c"
                },
                iconPath: {
                  fill: "#11172c"
                }
              }
            }
            }
          });
        } catch (error) {
          observer.disconnect();
          showLoadError(error);
        }
      })
      .catch(showLoadError);
  }

  const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
  if (window.ShopifyBuy?.UI) {
    initializeShopifyBuyButton();
  } else if (existingScript) {
    existingScript.addEventListener("load", initializeShopifyBuyButton, {
      once: true
    });
    existingScript.addEventListener("error", showLoadError, { once: true });
  } else {
    const script = document.createElement("script");
    script.async = true;
    script.src = scriptUrl;
    script.addEventListener("load", initializeShopifyBuyButton, { once: true });
    script.addEventListener("error", showLoadError, { once: true });
    document.head.append(script);
  }
})();
