import { createApp } from "vue";
import "./style.css";
import { createPinia } from "pinia";
import App from "./App.vue";

// Vuetify
import "vuetify/styles";
import vuetify from "./plugins/vuetify";

// mdi
import "@mdi/font/css/materialdesignicons.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);

app.mount("#app");
