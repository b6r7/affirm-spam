import { Check, AlertTriangle, ChevronDown, Loader2, Copy, FileUp } from 'lucide-react';
import { Locale, Tone, Variant, localeLabels, localeMetadata, complianceRules } from '../data/contentData';
import { TemplateType, TemplateInfo } from '../data/templateData';
import { TemplateSelector } from './TemplateSelector';
import { EllipsisMenu } from './EllipsisMenu';
import { TemplateCreationPanel, type DraftPayload } from './TemplateCreationPanel';
import { AddTranslationModal } from './AddTranslationModal';
import { useState, useRef, useEffect } from 'react';
import type { GeneratedState, EmailContent, LayoutMode, PreviewDevice } from 'figma-plugin/messageTypes';
import { RECOMMENDED_VARIANT } from 'figma-plugin/messageTypes';
import { PREVIEW_DEVICE_WIDTHS } from 'figma-plugin/emailLayout';
import { buildEmailLayoutSpec, normalizePlaceholderTags } from '../../plugin/emailLayout/spec';
import { RenderSpecToReact } from '../../plugin/emailLayout/renderReact';
import {
  EMAIL_SAFE_WIDTH_DESKTOP,
  EMAIL_SAFE_WIDTH_MOBILE,
  SPACING_SECTION_GAP,
} from '../../plugin/emailLayout/tokens';
import { getPreviewOverrides, applyOverridesToContent } from '../lib/previewOverrides';
import { EditableEmailPreview } from './EditableEmailPreview';

function formatTimeAgo(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day ago`;
    return d.toLocaleDateString();
  } catch {
    return isoString;
  }
}

/** Inline logo mark for the left-column header (from figma-plugin/spam.svg). */
function LogoMark() {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: 32, width: 'auto', display: 'block', flexShrink: 0 }}
      aria-hidden
    >
      <path d="M87.4342 18.0049C97.0516 17.9503 106.215 18.3612 115.464 18.7172L115.463 18.7179L201.295 21.5194L201.316 21.5201L201.337 21.5207C208.314 21.7844 216.626 21.7412 224.338 22.3065C225.793 22.4131 227.347 22.3911 229.454 22.3766C231.328 22.3636 233.643 22.3593 235.99 22.5997C237.155 22.6705 241.597 22.7153 245.002 23.644C246.972 24.1811 249.562 25.2075 251.765 27.3666C254.162 29.7157 255.484 32.8008 255.677 36.2071C256.046 42.6737 255.952 49.1509 255.92 55.1781V55.1944C255.889 59.3049 254.441 62.9025 251.847 65.6976C251.136 66.4635 250.374 67.1297 249.593 67.712L249.613 204.914C249.608 206.281 249.632 209.062 249.241 211.771C249.042 213.15 248.697 214.826 248.031 216.496C247.381 218.128 246.214 220.282 244.061 221.984C242.388 223.306 240.458 224.122 239.109 224.621C237.616 225.175 236.031 225.625 234.602 225.987C232.048 226.636 228.595 227.318 227.649 227.534C222.861 228.646 218.078 229.786 213.301 230.952L213.292 230.954C204.93 232.985 195.545 235.611 186.608 237.545C183.81 238.15 179.019 239.01 175.11 238.839C163.441 238.331 151.52 236.532 140.648 235.201L140.643 235.201L89.2452 228.877L32.2691 221.932C28.4011 221.467 24.8232 221.014 21.9339 220.276C18.9814 219.521 15.4803 218.177 12.8239 215.035C10.2096 211.942 9.43398 208.302 9.10745 205.363C8.78349 202.447 8.78771 198.856 8.78771 195.002L8.79859 84.6468L8.80607 80.2139C8.81587 75.8816 8.82242 71.6553 8.73124 67.4079C8.32231 67.1965 7.91607 66.965 7.51962 66.7092C3.86601 64.3518 1.73767 60.6539 1.25334 56.1332L1.19756 55.5754C0.934806 52.7916 0.938574 50.0741 0.981221 47.6628C1.02907 44.9575 1.11627 42.8215 1.07442 40.6073C0.868087 36.7043 1.46447 32.7479 3.68679 29.3422C6.03191 25.7484 9.40667 23.9502 12.3852 23.0487C15.1995 22.1969 18.1248 22.0025 20.3672 21.9187C23.1116 21.8161 24.535 21.8649 26.6477 21.7303L49.3787 20.2397L49.4291 20.237C61.383 19.5261 74.5285 18.0783 87.4342 18.0049ZM17.1473 195.002C17.1473 211.114 17.2647 211.708 33.2807 213.634L90.2568 220.579L141.663 226.904C152.865 228.275 164.238 229.999 175.475 230.488C178.235 230.608 182.128 229.961 184.839 229.375C193.704 227.457 202.491 224.975 211.319 222.83C216.128 221.656 220.944 220.509 225.766 219.39C228.873 218.676 236.364 217.411 238.878 215.425C241.291 213.518 241.243 207.919 241.254 204.886L241.233 67.1555C241.237 66.1503 241.312 63.701 241.178 62.7859C244.81 61.4363 247.529 59.2855 247.56 55.1325C247.593 48.9845 247.681 42.8241 247.331 36.682C246.996 30.7824 239.592 31.237 235.326 30.9341C231.547 30.5188 227.466 30.9178 223.726 30.6436C216.143 30.0878 208.592 30.1603 201.022 29.8742L115.142 27.0707C105.814 26.7116 96.8703 26.3111 87.4818 26.3645C74.8409 26.4363 62.4998 27.8338 49.925 28.5816L27.194 30.0715C18.5726 30.6231 8.70415 28.7007 9.43059 40.3577C9.53021 45.2658 9.04214 50.3628 9.56529 55.242C10.0488 59.7576 13.2172 60.5454 17.0514 61.3287C16.9441 63.2362 17.0436 65.1425 17.0854 67.0507C17.2149 72.9149 17.1589 78.7819 17.1582 84.6475L17.1473 195.002Z" fill="#A0B8FF"/>
      <path d="M87.6909 24.6233C97.1548 24.5679 106.17 24.9829 115.508 25.3528L115.507 25.3538L138.387 26.1292L138.386 26.1301L201.618 28.2463H201.627C209.091 28.5367 216.826 28.4684 224.458 29.0442C226.245 29.179 228.12 29.1492 230.117 29.135C232.064 29.1212 234.115 29.1224 236.112 29.345C238.02 29.4822 241.282 29.4616 243.928 30.2043C245.308 30.5917 246.715 31.2271 247.814 32.3352C248.949 33.4803 249.632 35.0065 249.738 36.9172C250.092 43.3225 250.004 49.7446 249.97 56.0657V56.0696C249.952 58.622 249.114 60.6638 247.676 62.2581C246.278 63.8083 244.403 64.8368 242.451 65.5833L242.237 65.6653L242.009 65.6887L239.025 65.9993L238.986 66.0032L238.946 66.0051C237.935 66.0638 237.291 66.142 236.274 66.3118L236.074 66.345L235.872 66.3313C235.505 66.3067 234.645 66.3506 233.596 66.4329C232.579 66.5127 231.606 66.6088 230.974 66.6624L230.973 66.6614L220.219 67.6301H220.217C210.698 68.4781 201.331 69.1725 191.854 70.0715C184.961 70.7253 176.975 71.895 169.923 71.9846C164.013 72.0599 156.999 71.2012 151.322 70.928V70.929C137.702 70.3757 124.087 69.7178 110.477 68.9543V68.9534C81.4574 67.3616 52.0632 66.3332 23.0142 64.5667L22.9468 64.5627L22.8794 64.553C21.9005 64.4166 21.1622 64.3527 20.1587 64.2981C19.0741 64.3004 17.9923 64.2392 16.9907 64.1917L16.8511 64.1848L16.7144 64.1565C14.8522 63.7649 12.7566 63.3089 11.0962 62.2063C9.27743 60.9985 8.12322 59.1347 7.8335 56.3508L7.74365 55.3635C7.55966 53.059 7.5591 50.7387 7.59814 48.47C7.63769 46.1717 7.7156 43.9615 7.70166 41.7766L7.68994 40.842C7.50622 37.6518 8.00532 35.1362 9.22021 33.22C10.4623 31.2608 12.3019 30.1611 14.3042 29.5374C16.268 28.9256 18.4867 28.7404 20.644 28.6575C22.9091 28.5704 24.9746 28.595 27.1274 28.4534L49.9224 26.9153L49.9331 26.9143C62.4101 26.1506 74.9578 24.6978 87.6909 24.6233Z" fill="#8788FF" stroke="black" strokeWidth="3.48316"/>
      <path d="M13.1712 36.4263C14.9706 34.2627 15.8121 34.1793 18.6607 33.9382C21.7704 33.6751 24.9352 33.5768 28.0568 33.3573L56.7747 31.4134L75.3567 30.1155C78.7207 29.8746 83.1861 29.4283 86.4373 29.4092C94.753 29.3607 103.233 29.8706 111.558 30.1296L161.317 31.707L215.33 33.4495C223.871 33.7474 232.418 33.9405 240.956 34.3775C242.892 34.4765 243.735 34.9155 245.036 36.2747C245.306 37.8738 245.265 39.5672 245.241 41.1932C245.17 45.9227 245.396 50.6903 245.184 55.4116C245.081 57.7194 243.669 58.7978 241.662 59.5305C239.265 60.0196 233.83 60.3268 231.119 60.5558L210.114 62.2923C202.516 62.9377 194.888 63.5304 187.3 64.2462C180.23 64.913 173.284 66.0802 166.131 65.6673C163.229 65.4997 160.338 65.2306 157.433 65.0823L134.245 63.9768L62.2746 60.4571L30.7486 58.8999C27.4542 58.744 19.0166 58.6858 16.2427 58.0758C14.7052 57.4714 14.3429 57.1689 13.2715 55.905C12.8814 53.546 13.0089 49.6641 13.0291 47.1797C13.057 43.7266 12.9768 39.8499 13.1712 36.4263Z" fill="#484AF6"/>
      <path d="M13.1712 36.4263C14.9706 34.2627 15.8121 34.1793 18.6607 33.9382C21.7704 33.6751 24.9352 33.5768 28.0568 33.3573L56.7747 31.4134L75.3567 30.1155C78.7207 29.8746 83.1861 29.4283 86.4373 29.4092C94.753 29.3607 103.233 29.8706 111.558 30.1296L161.317 31.707L215.33 33.4495C223.871 33.7474 232.418 33.9405 240.956 34.3775C242.892 34.4765 243.735 34.9155 245.036 36.2747C245.306 37.8738 245.265 39.5672 245.241 41.1932C245.17 45.9227 245.396 50.6903 245.184 55.4116C245.081 57.7194 243.669 58.7978 241.662 59.5305L241.81 58.2531C242.504 52.451 242.063 46.4054 242.437 40.5663C242.437 40.5663 242.145 40.194 242.116 40.157C241.519 40.0586 241.224 40.0797 240.825 39.6588C240.665 39.0697 240.918 38.6896 241.162 38.0985C241.041 37.7658 241.093 37.8808 240.852 37.6018C239.392 37.2841 236.505 37.5251 234.697 37.3686C221.098 36.1919 207.266 36.2649 193.58 35.765C166.445 34.7077 139.303 33.8156 112.157 33.0885C104.099 32.9249 95.0386 31.8971 87.1137 32.2581C73.2278 32.8906 59.3718 34.6123 45.4433 35.0365C43.5067 35.0954 33.4139 35.9218 32.3557 36.4771C33.113 37.004 44.443 37.1 46.7704 37.4835L46.9557 37.5154C41.313 37.8838 34.8894 37.007 29.1951 37.0486C27.2912 37.0625 20.3758 36.0698 18.9762 36.5096C18.7073 37.0119 18.7366 37.1113 18.7094 37.701C18.5478 37.0431 18.66 37.0256 18.2496 36.6599L17.8491 36.8102C17.3399 37.4115 16.7247 38.18 16.1939 38.7384L15.879 38.9815C15.9173 41.4587 15.9299 54.5162 16.3778 57.9699C16.3332 58.0052 16.2879 58.0405 16.2427 58.0758C14.7052 57.4714 14.3429 57.1689 13.2715 55.905C12.8814 53.546 13.0089 49.6641 13.0291 47.1797C13.057 43.7266 12.9768 39.8499 13.1712 36.4263Z" fill="#8788FF"/>
      <path d="M15.8791 38.9815C15.2327 38.9969 14.8098 38.5769 14.7388 37.9254C14.5346 36.0612 16.7548 35.7669 17.8492 36.8102C17.34 37.4115 16.7249 38.18 16.194 38.7384L15.8791 38.9815Z" fill="#8788FF"/>
      <path d="M241.162 38.0984C242.133 37.4912 242.689 37.576 243.381 38.4785C243.503 39.5664 243.179 39.8917 242.116 40.1569C241.519 40.0585 241.224 40.0796 240.825 39.6587C240.665 39.0696 240.918 38.6894 241.162 38.0984Z" fill="#8788FF"/>
      <path d="M18.9768 36.5095C20.3768 36.0699 27.2918 37.0628 29.1956 37.049C34.8898 37.0074 41.3137 37.884 46.9563 37.5156C53.2746 37.7138 59.2836 38.2127 65.4334 38.4381C88.496 39.1835 111.552 40.1201 134.598 41.2471C143.975 41.7283 153.373 41.7873 162.75 42.2546C164.414 42.3376 166.115 42.535 166.59 44.2928C166.211 45.2313 164.189 45.079 163.316 45.0534C150.965 44.6612 138.618 44.16 126.276 43.5493L59.3031 40.6865C48.899 40.2495 38.4545 40.0823 28.0616 39.415C25.9053 39.2766 21.5087 39.3788 19.5863 39.0157L19.4088 38.979L19.07 38.9252C18.2055 38.7971 16.8759 38.6616 16.1943 38.7381C16.7251 38.1797 17.3403 37.4115 17.8495 36.8102L18.2502 36.6598C18.6604 37.0255 18.5485 37.043 18.7101 37.7007C18.7372 37.1112 18.7079 37.0117 18.9768 36.5095Z" fill="#8788FF"/>
      <path d="M233.707 38.3636C235.108 38.242 237.861 37.7633 238.508 39.3967C238.25 40.2367 236.8 40.67 236.01 40.7677C229.5 41.5982 222.932 41.8614 216.398 42.4197C206.011 43.3073 195.669 44.2153 185.263 44.8886C183.923 45.0017 181.508 45.5122 180.851 44.0492C181.41 42.0531 184.818 42.0622 186.492 41.9727C189.815 41.795 193.118 41.6925 196.435 41.4074L233.707 38.3636Z" fill="#8788FF"/>
      <path d="M172.512 48.4216C173.311 48.4176 174.416 48.336 175.033 48.827C175.775 50.6842 175.568 60.3283 175.271 62.6179C175.208 63.1038 175.232 62.9836 174.91 63.2119L172.572 63.5899C172.498 61.1252 171.694 50.4571 172.512 48.4216Z" fill="#8788FF"/>
      <path d="M172.51 42.9363C174.335 42.8549 176.891 42.585 178.113 44.3139C178.179 45.7297 175.717 45.6317 174.705 45.6756C173.243 45.735 169.591 46.039 168.999 44.2421L169.212 43.8362C170.169 43.0885 171.324 43.0592 172.51 42.9363Z" fill="#8788FF"/>
      <path d="M23.7301 61.7428C52.7196 63.4556 81.9264 64.4471 110.94 65.9934C124.502 66.7325 138.071 67.3693 151.643 67.905C157.53 68.1795 164.244 68.9986 170.1 68.9261C177.039 68.8405 184.82 67.7269 191.828 67.0812C201.271 66.2108 210.677 65.5318 220.122 64.7144L230.856 63.7762C232.029 63.6796 234.968 63.3852 236.002 63.4524C237.069 63.2795 237.773 63.1976 238.852 63.1368C238.892 63.9108 239.057 64.7713 238.669 65.3729C238.093 65.7159 237.567 65.682 236.887 65.7287L193.177 69.9378L180.529 71.2154C174.363 71.8779 168.764 72.56 162.575 71.7923C160.414 71.5248 157.943 71.4939 155.753 71.3943L57.6854 66.709C46.4483 66.1826 34.9297 65.7954 23.7274 65.1233C23.7978 64.1086 23.7434 62.7814 23.7301 61.7428Z" fill="#4343A3"/>
      <path d="M20.832 61.4802C21.8888 61.5355 22.6825 61.601 23.7301 61.7428C23.7367 62.262 23.7529 62.8533 23.7594 63.4415C23.7626 63.7359 23.7633 64.0295 23.7587 64.313C23.7541 64.5962 23.745 64.8697 23.7274 65.1233L20.8545 65.0219C20.9116 63.6899 20.9595 62.8221 20.832 61.4802Z" fill="#4343A3"/>
      <path d="M23.7301 64.2403C52.7196 65.9531 81.9264 66.9446 110.94 68.4908C124.502 69.23 138.071 69.8667 151.643 70.4025C157.53 70.6769 164.244 71.496 170.1 71.4236C177.039 71.3379 184.82 70.2244 191.828 69.5786C201.271 68.7082 210.677 68.0292 220.122 67.2118L230.856 66.2737C232.029 66.1771 234.968 65.8826 236.002 65.9499C237.069 65.7769 237.773 65.695 238.852 65.6342C238.892 66.4082 239.057 67.2687 238.669 67.8704C238.093 68.2133 237.567 68.1794 236.887 68.2262L193.177 72.4352L180.529 73.7128C174.363 74.3753 168.764 75.0574 162.575 74.2897C160.414 74.0222 157.943 73.9913 155.753 73.8917L57.6854 69.2065C46.4483 68.68 34.9297 68.2928 23.7274 67.6207C23.7978 66.606 23.7434 65.2788 23.7301 64.2403Z" fill="#4343A3"/>
      <path d="M20.832 63.9777C21.8888 64.033 22.6825 64.0984 23.7301 64.2403C23.7367 64.7594 23.7529 65.3507 23.7594 65.939C23.7626 66.2333 23.7633 66.527 23.7587 66.8104C23.7541 67.0937 23.745 67.3671 23.7274 67.6207L20.8545 67.5193C20.9116 66.1874 20.9595 65.3195 20.832 63.9777Z" fill="#4343A3"/>
      <path d="M23.6962 67.7206C24.8457 67.7213 26.8227 67.646 27.8691 67.9156L31.0659 68.041C38.1471 68.032 47.08 68.7829 54.3731 69.0922L113.362 71.9512L146.343 73.5179C149.088 73.6698 156.11 73.7666 158.385 74.147C159.499 74.0996 160.57 74.2174 161.679 74.3121C162.594 74.7259 171.187 74.6688 172.513 74.5706C180.825 73.9554 189.099 72.7147 197.403 71.9833C205.031 71.311 212.655 70.6241 220.281 69.9505C225.496 69.4893 230.758 68.7126 235.996 68.5712C236.905 68.4722 237.987 68.3838 238.865 68.1915C238.908 114.318 238.505 160.94 239.033 207.011C237.904 207.245 237.175 207.571 236.119 208.002C234.811 208.721 228.735 209.658 226.858 210.062L206.715 214.512L191.871 217.833C188.63 218.58 178.532 221.366 175.789 220.541C174.729 220.387 173.605 220.301 172.534 220.201C171.403 220.242 163.059 219.287 161.635 219.059C160.845 218.887 159.341 218.745 158.49 218.638C155.258 218.148 151.089 217.824 147.718 217.418L127.675 214.902L60.2255 206.558C52.6273 205.569 44.9992 204.735 37.3906 203.835C35.3766 203.597 32.517 203.368 30.5859 202.959C29.7214 202.741 28.7357 202.698 27.8398 202.629C26.7816 202.461 23.9331 202.34 23.0776 202.042C22.3524 201.91 21.5241 201.837 20.7822 201.753C20.9947 186.789 20.8226 171.489 20.8226 156.494L20.8282 67.5994L23.6962 67.7206Z" fill="#FEFEFE"/>
      <path d="M235.995 68.5712C236.904 68.4723 237.986 68.3838 238.864 68.1915C238.907 114.318 238.504 160.94 239.032 207.011C237.903 207.245 237.174 207.571 236.118 208.002C234.81 208.721 228.734 209.658 226.857 210.063L206.714 214.512L191.871 217.833C188.629 218.58 178.531 221.366 175.788 220.541C174.729 220.387 173.604 220.301 172.533 220.201C171.402 220.242 163.059 219.287 161.634 219.06C160.844 218.887 159.34 218.745 158.489 218.638C158.39 207.095 158.368 195.551 158.422 184.007L158.41 129.974L158.415 92.0477C158.414 86.4767 158.155 79.5285 158.384 74.147C159.498 74.0997 160.57 74.2174 161.678 74.3121C162.593 74.7259 171.186 74.6688 172.513 74.5706C180.824 73.9555 189.099 72.7147 197.402 71.9833C205.03 71.311 212.655 70.6242 220.281 69.9505C225.495 69.4893 230.757 68.7126 235.995 68.5712Z" fill="#FEFEFE"/>
      <path d="M172.534 220.201L172.545 125.588L172.543 94.518C172.542 89.7802 172.567 84.9783 172.497 80.2796C172.464 78.0099 173.943 75.8915 175.273 77.741C176.375 79.2722 175.769 87.1588 175.766 89.1121L175.785 110.651L175.784 185.123L175.789 208.129C175.782 211.969 175.615 216.818 175.789 220.541C174.729 220.387 173.605 220.301 172.534 220.201Z" fill="#D6D6D6"/>
      <path d="M23.6962 67.7206C24.8457 67.7213 26.8227 67.646 27.8691 67.9156C27.7019 73.3389 27.9401 78.9781 27.7437 84.2802L27.759 137.134C27.7632 149.144 27.961 161.677 27.7604 173.636C27.9687 183.225 27.5688 193.083 27.8398 202.629C26.7816 202.461 23.9331 202.34 23.0776 202.042C22.3524 201.91 21.5241 201.837 20.7822 201.753C20.9947 186.789 20.8226 171.489 20.8226 156.494L20.8282 67.5994L23.6962 67.7206Z" fill="#FEFEFE"/>
      <path d="M20.8282 67.5994L23.6962 67.7206L23.6642 157.658L23.6607 185.186C23.6607 187.239 23.9171 201.199 23.3117 201.97L23.0776 202.042C22.3524 201.91 21.5241 201.837 20.7822 201.753C20.9947 186.789 20.8226 171.489 20.8226 156.494L20.8282 67.5994Z" fill="#D6D6D6"/>
      <path d="M124.378 138.462C125.888 138.51 127.989 138.376 129.287 139.236C130.76 140.212 133.651 156.372 134.278 159.147C134.703 158.143 134.974 157.265 135.312 156.223C136.994 151.057 138.399 145.748 140.348 140.677C140.49 140.308 141.085 139.632 141.55 139.579C142.97 139.225 149.292 138.944 149.351 141.383C149.552 149.771 148.757 158.899 148.334 167.341C148.27 168.623 147.326 169.682 146.177 169.838C141.872 170.423 142.89 164.69 143.032 162.026C143.216 158.715 143.379 155.404 143.522 152.092C143.578 150.666 143.727 148.322 143.59 146.96L143.402 146.87L143.187 147.609C141.855 153.808 139.055 161.124 137.175 167.27C136.566 169.26 134.189 169.904 132.353 168.959C131.732 168.644 131.233 168.132 130.935 167.503C130.232 165.994 129.826 162.947 129.418 161.264C128.223 156.335 127.435 149.665 125.931 144.95C126.076 147.833 125.594 164.558 124.937 166.83C124.724 167.564 124.28 168.201 123.595 168.565C122.934 168.917 122.165 168.899 121.467 168.672C120.805 168.456 120.216 168.056 119.917 167.408C119.289 166.045 120.338 144.443 120.744 141.313C120.841 140.565 121.084 139.891 121.366 139.194C122.459 138.684 123.194 138.565 124.378 138.462Z" fill="black"/>
      <path d="M92.1437 102.65C110.46 101.617 125.113 112.405 130.444 129.807C127.943 129.809 125.378 129.659 122.874 129.546C118.574 119.149 111.874 112.979 100.827 110.341C96.359 109.537 92.4035 109.514 87.9486 110.569C81.0471 112.209 74.9725 116.293 70.8477 122.066C69.5011 123.95 68.9947 125.183 67.8696 127.001C65.3896 126.842 62.7863 126.761 60.2944 126.648C65.9831 112.828 77.1418 104.066 92.1437 102.65Z" fill="#484AF6"/>
      <path d="M68.9092 136.055C71.9681 135.783 75.5021 136.24 78.5729 136.292C84.9282 136.399 89.8952 139.244 89.2592 146.316C88.4783 154.988 80.8028 154.891 74.1054 154.405L72.1325 154.359C71.9535 157.266 72.2043 160.542 71.6254 163.379C71.4226 164.373 70.9719 165.455 70.0719 166.006C69.4024 166.415 68.5539 166.456 67.8183 166.217C66.9969 165.951 66.3365 165.382 65.9367 164.619C65.3278 163.456 66.4738 139.272 67.0304 137.743C67.3543 136.856 68.1143 136.441 68.9092 136.055Z" fill="black"/>
      <path d="M72.7266 140.581C75.4755 141.115 79.8483 140.234 82.0169 142.361C83.7647 144.076 83.3474 147.151 81.725 148.839C79.1105 150.464 75.4658 149.899 72.3853 149.801C72.3936 146.896 72.6068 143.518 72.7266 140.581Z" fill="#FEFEFE"/>
      <path d="M101.438 136.964C103.149 136.777 105.509 137.301 106.202 139.043C109.459 147.232 112.239 155.73 115.088 164.077C115.782 166.109 115.147 167.572 113.114 168.338C112.568 168.548 111.96 168.519 111.436 168.259C109.484 167.299 108.388 162.585 107.743 160.456C106.129 160.453 104.23 160.332 102.596 160.267C100.229 160.185 97.8639 160.051 95.5023 159.865C95.0767 161.292 93.2048 166.173 91.8408 167.095C91.3351 167.438 90.2595 167.445 89.6179 167.224C88.8384 166.955 88.2121 166.364 87.8972 165.602C87.6214 164.927 87.6053 164.069 87.8812 163.395C90.449 157.111 93.4006 150.966 96.1307 144.749C97.0934 142.712 97.8625 140.517 99.1039 138.63C99.6863 137.744 100.501 137.343 101.438 136.964Z" fill="black"/>
      <path d="M102.227 143.635C102.841 144.192 105.815 154.419 106.232 155.856L102.045 155.649L97.355 155.47C98.9726 151.981 100.736 147.276 102.227 143.635Z" fill="#FEFEFE"/>
      <path d="M46.8181 134.583C51.6109 134.341 59.0405 135.251 60.153 141.459C60.4184 142.939 58.9729 145.235 57.3672 145.046C55.402 144.814 54.4316 141.658 53.046 140.303C51.9251 139.196 50.4009 138.592 48.8258 138.633C47.4778 138.658 45.468 139.341 44.575 140.337C44.0427 140.94 43.7919 141.74 43.8846 142.539C44.304 146.415 55.1289 146.866 58.2742 150.182C61.7365 153.832 61.6501 158.162 58.5779 162.025C56.665 164.43 52.706 165.304 49.9481 165.453C46.8404 165.468 43.5997 164.993 40.981 163.204C38.8995 161.792 37.4721 159.604 37.02 157.13C36.8953 156.41 36.866 155.163 37.3704 154.68C41.7836 150.547 42.1486 157.675 44.8829 159.743C47.8958 162.024 53.4549 161.292 54.7583 157.401C55.3783 155.782 54.054 154.181 52.6614 153.436C48.1905 151.045 39.1357 150.569 38.2057 144.149C37.3753 138.42 41.6435 135.335 46.8181 134.583Z" fill="black"/>
      <path d="M20.7632 204.354C21.9621 204.37 22.5491 204.352 23.7035 204.617C35.3998 205.975 47.0893 207.393 58.7704 208.871L173.649 223.009L175.637 223.135C180.829 223.371 188.751 221.113 194.073 219.96L221.803 213.785C226.377 212.777 231.265 211.618 235.836 210.815C236.919 210.448 238.009 210.105 239.107 209.787C238.512 211.584 238.066 212.604 236.966 213.397C236.866 213.47 236.761 213.54 236.649 213.609C236.204 213.884 235.663 214.137 234.987 214.392C232.481 215.234 228.989 215.746 226.363 216.37C221.727 217.47 217.08 218.558 212.446 219.662C207.15 220.871 201.868 222.145 196.604 223.484C190.61 225.034 183.416 227.146 177.27 227.696C175.258 227.876 169.82 227.155 167.509 226.92C159.596 226.072 151.692 225.128 143.801 224.088L39.5348 211.323C36.0773 210.898 27.1639 210.288 24.4736 209.295C22.2912 208.267 21.6068 206.43 20.7632 204.354Z" fill="#8788FF"/>
    </svg>
  );
}

interface CommsForgePanelProps {
  locale: Locale;
  tone: Tone;
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  previewDevice: PreviewDevice;
  onPreviewDeviceChange: (device: PreviewDevice) => void;
  selectedVariants: Variant[];
  isGenerating: boolean;
  exportState: 'idle' | 'exporting-selected' | 'exporting-all' | 'exported-selected' | 'exported-all';
  lastExportedAt: number | null;
  hasGenerated: boolean;
  selectedTemplate: TemplateType;
  isBaseTemplate: boolean;
  isDeprecated: boolean;
  isAddingNewTemplate: boolean;
  hasNewTemplate: boolean;
  onLocaleChange: (locale: Locale) => void;
  onToneChange: (tone: Tone) => void;
  onVariantToggle: (variant: Variant) => void;
  onGenerate: () => void;
  onExportSelected: () => void;
  onExportAll: () => void;
  onInsertToCanvas: () => void;
  onTemplateChange: (template: TemplateType) => void;
  onToggleBaseTemplate: () => void;
  onDuplicateTemplate: () => void;
  onRenameTemplate: () => void;
  onRenameSubmit: (name: string) => void;
  onDeleteTemplate: () => void;
  onMarkDeprecated: () => void;
  onAddNewTemplate: () => void;
  onCancelNewTemplate: () => void;
  onDraftChange: (payload: DraftPayload) => void;
  onSaveTemplate: (payload: DraftPayload) => void;
  templateCatalog: TemplateInfo[];
  getTemplateById: (id: TemplateType) => TemplateInfo | undefined;
  onExportTranslations: () => void;
  onImportTranslations: (json: string) => void;
  isCustomTemplateSelected: boolean;
  /** Cached generated variants from main thread; null until user clicks Generate variants. */
  generated?: GeneratedState | null;
  /** True when generated matches current template/locale/tone (so left panel shows generated content). */
  generatedMatches: boolean;
  /** Effective locale for current selection (used for stale check). */
  contentLocale: Locale;
  ui?: { isLocaleSelectorDisabled: boolean; localeLockReason?: string };
  customTemplateLocales?: Locale[];
  customTemplateBaseLocale?: Locale;
  selectedTemplateLocale?: Locale;
  onSelectTemplateLocale?: (locale: Locale) => void;
  onCreateTranslation?: (targetLocale: Locale) => void;
  onSyncToFile?: () => void;
  onPullFromFile?: () => void;
  onDownloadLibraryJson?: (payload: { format: 'single' | 'per_locale'; locales?: Locale[] }) => void;
  /** Locales available for per-locale export (from customTemplatesContent or LOCALES fallback). */
  availableExportLocales?: Locale[];
  syncMeta?: { lastSyncedAt: string; lastSyncedBy?: string };
  autoSyncToFile?: boolean;
  onAutoSyncChange?: (enabled: boolean) => void;
  /** For Library status line: not synced / synced timeAgo / local changes not synced */
  libraryStatus?: {
    localHash: string;
    fileHash?: string;
    lastSyncedAt?: string;
    lastSyncedBy?: string;
  };
  /** Web app only: hide Insert to canvas, show Export JSON (single/zip), enable inline edit */
  isWebApp?: boolean;
  previewOverrideVersion?: number;
  onPreviewEdit?: (variant: Variant, slot: import('../lib/previewOverrides').EditableSlot, value: string) => void;
  onExportJson?: (format: 'single' | 'per_locale', locales: Locale[]) => Promise<void>;
}

export function CommsForgePanel({
  locale,
  tone,
  layoutMode,
  onLayoutModeChange,
  previewDevice,
  onPreviewDeviceChange,
  selectedVariants,
  isGenerating,
  exportState,
  lastExportedAt = null,
  hasGenerated = false,
  selectedTemplate,
  isBaseTemplate,
  isDeprecated,
  isAddingNewTemplate,
  hasNewTemplate,
  onLocaleChange,
  onToneChange,
  onVariantToggle,
  onGenerate,
  onExportSelected,
  onExportAll,
  onInsertToCanvas,
  onTemplateChange,
  onToggleBaseTemplate,
  onDuplicateTemplate,
  onRenameTemplate,
  onDeleteTemplate,
  onMarkDeprecated,
  onAddNewTemplate,
  onCancelNewTemplate,
  onDraftChange,
  onSaveTemplate,
  templateCatalog,
  getTemplateById,
  onExportTranslations,
  onImportTranslations,
  isCustomTemplateSelected,
  generated,
  generatedMatches,
  contentLocale,
  ui,
  customTemplateLocales = [],
  customTemplateBaseLocale,
  selectedTemplateLocale,
  onSelectTemplateLocale,
  onCreateTranslation,
  onSyncToFile,
  onPullFromFile,
  onDownloadLibraryJson,
  availableExportLocales = [],
  syncMeta,
  autoSyncToFile = false,
  onAutoSyncChange,
  libraryStatus,
  isWebApp = false,
  previewOverrideVersion = 0,
  onPreviewEdit,
  onExportJson,
}: CommsForgePanelProps) {
  const [exportFormat, setExportFormat] = useState<'single' | 'per_locale'>('single');
  const [exportLocalesSelected, setExportLocalesSelected] = useState<Locale[]>(() =>
    availableExportLocales.length > 0 ? [...availableExportLocales].sort() : []
  );
  useEffect(() => {
    if (availableExportLocales.length > 0) {
      setExportLocalesSelected((prev) => {
        const avail = new Set(availableExportLocales);
        const sorted = [...availableExportLocales].sort();
        const kept = prev.filter((l) => avail.has(l));
        const added = sorted.filter((l) => !prev.includes(l));
        if (added.length === 0 && kept.length === prev.length) return prev;
        return [...kept, ...added].sort();
      });
    }
  }, [availableExportLocales]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddTranslationModal, setShowAddTranslationModal] = useState(false);
  const [activePreviewVariant, setActivePreviewVariant] = useState<Variant>(RECOMMENDED_VARIANT);
  const [showWidthGuides, setShowWidthGuides] = useState(true);
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);
  const syncMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!syncMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (syncMenuRef.current && !syncMenuRef.current.contains(e.target as Node)) setSyncMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [syncMenuOpen]);
  const complianceIssues = complianceRules[locale];
  const hasCompliance = complianceIssues && complianceIssues.length > 0;

  const generatedStale = generated != null && !generatedMatches;

  const isLocaleSelectorDisabled = ui?.isLocaleSelectorDisabled ?? isCustomTemplateSelected;
  const localeHelperText = isLocaleSelectorDisabled
    ? 'Locale is locked for custom templates. Create a translation to add another locale.'
    : 'Locale rules affect tone and compliance.';

  const templateInfo = getTemplateById(selectedTemplate);
  const templateIntent = templateInfo?.intent ?? 'Repayments';
  const hasSelectedVariants = selectedVariants.length > 0;

  return (
    <div
      className="flex flex-col h-full min-w-0"
      style={{
        backgroundColor: 'var(--card)',
        width: '100%',
        minWidth: 360,
        borderLeft: '1px solid var(--border)',
      }}
    >
      <div className="comms-forge-layout flex-1 min-h-0">
        <div className="comms-forge-layout__controls flex flex-col min-h-0">
        <div className="comms-forge-layout__controls-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 72 }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2" style={{ minHeight: 32 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <LogoMark />
              <div
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Email template
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onSyncToFile != null && onPullFromFile != null && (
                <div ref={syncMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setSyncMenuOpen((o) => !o)}
                    style={{
                      padding: '6px 10px',
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--foreground)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-button)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Sync
                    <ChevronDown size={14} style={{ opacity: syncMenuOpen ? 1 : 0.7 }} />
                  </button>
                  {syncMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 4,
                        minWidth: 220,
                        padding: 8,
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-button)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 50,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSyncToFile();
                          setSyncMenuOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 10px',
                          fontFamily: 'Calibre, sans-serif',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                          color: 'var(--foreground)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 4,
                        }}
                      >
                        Sync library to file
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPullFromFile();
                          setSyncMenuOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 10px',
                          fontFamily: 'Calibre, sans-serif',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                          color: 'var(--foreground)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 4,
                        }}
                      >
                        Restore from file
                      </button>
                      {onAutoSyncChange != null && (
                        <div
                          style={{
                            borderTop: '1px solid var(--border)',
                            marginTop: 4,
                            paddingTop: 8,
                            paddingBottom: 4,
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              cursor: 'pointer',
                              fontFamily: 'Calibre, sans-serif',
                              fontSize: 'var(--text-sm)',
                              color: 'var(--foreground)',
                            }}
                          >
                            <span
                              role="switch"
                              aria-checked={autoSyncToFile}
                              style={{
                                position: 'relative',
                                width: 36,
                                height: 20,
                                borderRadius: 10,
                                background: autoSyncToFile ? 'var(--accent)' : 'var(--muted)',
                                flexShrink: 0,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={autoSyncToFile}
                                onChange={(e) => onAutoSyncChange(e.target.checked)}
                                style={{
                                  position: 'absolute',
                                  opacity: 0,
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                  cursor: 'pointer',
                                }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 2,
                                  left: autoSyncToFile ? 18 : 2,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 8,
                                  background: '#fff',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                  transition: 'left 0.15s ease',
                                }}
                              />
                            </span>
                            Auto-sync
                          </label>
                          <div
                            style={{
                              fontFamily: 'Calibre, sans-serif',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--muted-foreground)',
                              marginTop: 2,
                              marginLeft: 44,
                            }}
                          >
                            Keeps this file&apos;s library up to date.
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 6,
                          paddingTop: 6,
                          fontFamily: 'Calibre, sans-serif',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {autoSyncToFile && syncMeta?.lastSyncedAt && (() => {
                          try {
                            const d = new Date(syncMeta.lastSyncedAt);
                            const secAgo = (Date.now() - d.getTime()) / 1000;
                            if (secAgo < 60) return 'Synced just now';
                            return `Last synced: ${isNaN(d.getTime()) ? syncMeta.lastSyncedAt : d.toLocaleString()}${syncMeta.lastSyncedBy ? ` by ${syncMeta.lastSyncedBy}` : ''}`;
                          } catch {
                            return syncMeta.lastSyncedAt ? `Last synced: ${syncMeta.lastSyncedAt}` : 'Not synced yet';
                          }
                        })()}
                        {autoSyncToFile && !syncMeta?.lastSyncedAt && 'Not synced yet'}
                        {!autoSyncToFile && (syncMeta?.lastSyncedAt ? (() => {
                          try {
                            const d = new Date(syncMeta.lastSyncedAt);
                            return `Last synced: ${isNaN(d.getTime()) ? syncMeta.lastSyncedAt : d.toLocaleString()}${syncMeta.lastSyncedBy ? ` by ${syncMeta.lastSyncedBy}` : ''}`;
                          } catch {
                            return 'Not synced yet';
                          }
                        })() : 'Manual sync')}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {templateCatalog.length > 0 && (
                <EllipsisMenu
                  isBaseTemplate={isBaseTemplate}
                  canDeleteTemplate={!!selectedTemplate && !isGenerating}
                  onDuplicate={onDuplicateTemplate}
                  onRename={() => {
                    const t = getTemplateById(selectedTemplate);
                    const name = t?.name?.[locale] ?? t?.name?.['en-US'] ?? '';
                    setRenameValue(name);
                    setShowRenameModal(true);
                  }}
                  onMarkDeprecated={onMarkDeprecated}
                  onDeleteTemplate={() => setShowDeleteConfirm(true)}
                />
              )}
            </div>
          </div>

          {libraryStatus != null && (
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)',
                marginTop: 4,
              }}
            >
              {!libraryStatus.lastSyncedAt ? (
                <span>Library status: Not synced to file yet</span>
              ) : (
                <>
                  <span>
                    Library status: Synced {formatTimeAgo(libraryStatus.lastSyncedAt)}
                    {libraryStatus.lastSyncedBy ? ` by ${libraryStatus.lastSyncedBy}` : ''}
                  </span>
                  {libraryStatus.fileHash != null &&
                    libraryStatus.localHash !== libraryStatus.fileHash && (
                      <span style={{ display: 'block', color: 'var(--accent)', marginTop: 2 }}>
                        Local changes not synced
                      </span>
                    )}
                </>
              )}
            </div>
          )}

          {(templateCatalog.length === 0 || !libraryStatus?.lastSyncedAt) && (
            <div
              style={{
                marginTop: 6,
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)',
                lineHeight: 1.35,
              }}
            >
              Create a template, then insert to canvas. Sync saves your library to this file.
            </div>
          )}

          {!isAddingNewTemplate && templateCatalog.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={onAddNewTemplate}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--accent)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-button)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Add new
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--foreground)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-button)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Import translations
              </button>
            </div>
          )}

          {isAddingNewTemplate ? (
            <TemplateCreationPanel
              onCancel={onCancelNewTemplate}
              onSaveTemplate={onSaveTemplate}
              onDraftChange={onDraftChange}
            />
          ) : templateCatalog.length === 0 ? (
            <div
              className="mb-4 p-4 border rounded-md"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--muted)',
                fontFamily: 'Calibre, sans-serif',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--foreground)',
                  marginBottom: 8,
                }}
              >
                No templates yet
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  marginBottom: 16,
                  lineHeight: 1.4,
                }}
              >
                Create a new template or import locale JSON to populate content.
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onAddNewTemplate}
                  style={{
                    padding: '10px 16px',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#fff',
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Add new
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--foreground)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-button)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Import translations
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <div 
                  style={{
                    width: '3px',
                    height: '20px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />
                <div className="flex-1">
                  <TemplateSelector
                    templates={templateCatalog}
                    selectedTemplate={selectedTemplate}
                    locale={locale}
                    hasNewTemplate={hasNewTemplate}
                    onTemplateChange={onTemplateChange}
                  />
                </div>
              </div>

              <div 
                className="mb-2 inline-flex items-center gap-1.5"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent)',
                }}
              >
                <div 
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                  }}
                />
                Active template
              </div>

              <div 
                className="mb-2"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                  lineHeight: '1.4',
                }}
              >
                Content is loaded from locale resources.
              </div>

              <div className="flex flex-wrap gap-1.5">
                <MetadataChip label={localeMetadata[locale]} />
                <MetadataChip label="Email" />
                <MetadataChip label={templateIntent} />
                {isDeprecated ? (
                  <DeprecatedBadge />
                ) : (
                  <StatusBadge isBase={isBaseTemplate} onClick={onToggleBaseTemplate} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div 
            className="mb-2"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Target locale
          </div>
          <div className="relative">
            <select
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              disabled={isLocaleSelectorDisabled}
              className="w-full px-3 py-2.5 border appearance-none pr-10"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: isLocaleSelectorDisabled ? 'not-allowed' : 'pointer',
                opacity: isLocaleSelectorDisabled ? 0.7 : 1,
              }}
            >
              {Object.entries(localeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown 
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={16}
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>
          <div 
            className="mt-2"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {localeHelperText}
          </div>
        </div>

        {isCustomTemplateSelected && customTemplateLocales.length > 0 && (
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div 
              className="mb-2"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Template locales
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedTemplateLocale ?? customTemplateBaseLocale ?? customTemplateLocales[0]}
                  onChange={(e) => onSelectTemplateLocale?.(e.target.value as Locale)}
                  className="w-full px-3 py-2.5 border appearance-none pr-10"
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {customTemplateLocales.map((loc) => (
                    <option key={loc} value={loc}>
                      {localeLabels[loc]}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={16}
                  style={{ color: 'var(--muted-foreground)' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAddTranslationModal(true)}
                className="px-3 py-2.5 border shrink-0"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                Add translation
              </button>
            </div>
          </div>
        )}

        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)', marginTop: 'var(--space-1)' }}>
          <div 
            className="mb-3"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tone
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <ToneButton label="Supportive" selected={tone === 'Supportive'} onClick={() => onToneChange('Supportive')} />
            <ToneButton label="Neutral" selected={tone === 'Neutral'} onClick={() => onToneChange('Neutral')} />
            <ToneButton label="Firm" selected={tone === 'Firm'} onClick={() => onToneChange('Firm')} />
            <ToneButton label="Educational" selected={tone === 'Educational'} onClick={() => onToneChange('Educational')} />
          </div>

          <div className="mb-3">
            <div
              className="mb-2"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email layout
            </div>
            <div className="flex gap-4" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-sm)' }}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="email-layout"
                  checked={layoutMode === 'affirm'}
                  onChange={() => onLayoutModeChange('affirm')}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span>Affirm default</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="email-layout"
                  checked={layoutMode === 'spi'}
                  onChange={() => onLayoutModeChange('spi')}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span>SPI</span>
              </label>
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2.5 text-white mb-2 flex items-center justify-center gap-2"
            style={{
              backgroundColor: isGenerating ? 'var(--muted)' : 'var(--accent)',
              borderRadius: 'var(--radius-button)',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
              border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating && <Loader2 size={16} className="animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate variants'}
          </button>

          <div
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            Variants preserve intent and compliance constraints.
          </div>
        </div>

        {generatedStale && (
          <div
            className="px-5 py-2 border-b flex items-center gap-2"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--foreground)',
              backgroundColor: 'rgba(255, 180, 0, 0.12)',
              borderColor: 'var(--border)',
            }}
          >
            <AlertTriangle size={14} />
            Outputs stale — template, locale, or tone changed. Run &quot;Generate variants&quot; again. Insert to canvas disabled.
          </div>
        )}

        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)', marginTop: generatedStale ? 0 : 'var(--space-1)' }}>
          <div
            className="mb-2"
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Variants &amp; actions
          </div>
          <div className="mb-2" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
            Select variants to insert or export.
          </div>
          <div className="space-y-2 mb-3">
            <VariantCard variant="A" selected={selectedVariants.includes('A')} onSelect={() => onVariantToggle('A')} recommendedVariant={RECOMMENDED_VARIANT} />
            <VariantCard variant="B" selected={selectedVariants.includes('B')} onSelect={() => onVariantToggle('B')} recommendedVariant={RECOMMENDED_VARIANT} />
            <VariantCard variant="C" selected={selectedVariants.includes('C')} onSelect={() => onVariantToggle('C')} recommendedVariant={RECOMMENDED_VARIANT} />
          </div>
        </div>

        {/* Export: scrolls with content */}
        <div className="px-5 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          {!isDeprecated && (
            <div
              className="mb-2"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Export
            </div>
          )}
          {!isDeprecated && (
            <div className="mb-2" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              Exports selected variants only.
            </div>
          )}
          {(onDownloadLibraryJson != null || (isWebApp && onExportJson != null)) && !isDeprecated && (
            <div className="mb-3 mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-sm)' }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'single'}
                      onChange={() => setExportFormat('single')}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    {isWebApp ? 'Single file (current locale)' : 'Single file (all locales)'}
                  </label>
                  <label className="flex items-center gap-2" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-sm)' }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === 'per_locale'}
                      onChange={() => setExportFormat('per_locale')}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    One file per locale
                  </label>
                </div>
                {exportFormat === 'per_locale' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        style={{
                          fontFamily: 'Calibre, sans-serif',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--foreground)',
                        }}
                      >
                        Locales to export
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setExportLocalesSelected([...availableExportLocales].sort())}
                          style={{
                            fontFamily: 'Calibre, sans-serif',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--accent)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => setExportLocalesSelected([])}
                          style={{
                            fontFamily: 'Calibre, sans-serif',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted-foreground)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div
                      className="flex flex-col gap-1 max-h-32 overflow-y-auto border rounded p-2"
                      style={{
                        borderColor: 'var(--border)',
                        fontFamily: 'Calibre, sans-serif',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {availableExportLocales.map((loc) => (
                        <label key={loc} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportLocalesSelected.includes(loc)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportLocalesSelected((prev) => [...prev, loc].sort());
                              } else {
                                setExportLocalesSelected((prev) => prev.filter((l) => l !== loc));
                              }
                            }}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          {localeLabels[loc] ?? loc}
                        </label>
                      ))}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: 'Calibre, sans-serif',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      Exports {exportLocalesSelected.length} JSON file(s), one per locale, ready for Smartling.
                    </div>
                    {exportLocalesSelected.length === 0 && (
                      <div
                        style={{
                          marginTop: 4,
                          fontFamily: 'Calibre, sans-serif',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--destructive, #dc2626)',
                        }}
                      >
                        Select at least one locale.
                      </div>
                    )}
                  </div>
                )}
                {exportFormat === 'per_locale' && availableExportLocales.length === 0 && (
                  <div
                    style={{
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    No locales available. Import translations first.
                  </div>
                )}
                <button
                  type="button"
                  disabled={
                    exportFormat === 'per_locale' &&
                    (exportLocalesSelected.length === 0 || availableExportLocales.length === 0)
                  }
                  onClick={async () => {
                    if (isWebApp && onExportJson) {
                      const locales = exportFormat === 'single' ? [contentLocale] : exportLocalesSelected;
                      if (exportFormat === 'per_locale' && locales.length === 0) return;
                      await onExportJson(exportFormat, locales);
                    } else if (onDownloadLibraryJson) {
                      if (exportFormat === 'single') {
                        onDownloadLibraryJson({ format: 'single' });
                      } else {
                        onDownloadLibraryJson({ format: 'per_locale', locales: exportLocalesSelected });
                      }
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#fff',
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    cursor:
                      exportFormat === 'per_locale' &&
                      (exportLocalesSelected.length === 0 || availableExportLocales.length === 0)
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      exportFormat === 'per_locale' &&
                      (exportLocalesSelected.length === 0 || availableExportLocales.length === 0)
                        ? 0.6
                        : 1,
                  }}
                >
                  Export JSON
                </button>
              </div>
            </div>
          )}
          {isDeprecated && (
            <div
              className="mb-2 p-2 border rounded"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)',
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
            >
              Deprecated templates cannot be exported.
            </div>
          )}
          {!isDeprecated && !isWebApp && (
            <>
              <button
                onClick={onExportSelected}
                disabled={!hasGenerated || !hasSelectedVariants || exportState === 'exporting-selected' || exportState === 'exporting-all'}
                className="w-full px-4 py-2 border mb-2 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: exportState === 'exported-selected' ? 'rgba(10, 137, 76, 0.12)' : 'transparent',
                  color: exportState === 'exported-selected' ? 'rgba(10, 137, 76, 1)' : 'var(--foreground)',
                  borderColor: exportState === 'exported-selected' ? 'rgba(10, 137, 76, 1)' : 'var(--border)',
                  borderRadius: 'var(--radius-button)',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: (!hasGenerated || !hasSelectedVariants || exportState === 'exporting-selected' || exportState === 'exporting-all') ? 'not-allowed' : 'pointer',
                  opacity: (!hasGenerated || !hasSelectedVariants || exportState === 'exporting-selected' || exportState === 'exporting-all') ? 0.7 : 1,
                }}
              >
                {exportState === 'exporting-selected' && <Loader2 size={14} className="animate-spin" />}
                {exportState === 'exported-selected' && <Check size={14} />}
                {exportState === 'exporting-selected' ? 'Exporting...' : exportState === 'exported-selected' ? 'Exported' : `Export selected${hasSelectedVariants ? ` (${selectedVariants.length})` : ''}`}
              </button>
              <button
                onClick={onExportAll}
                disabled={!hasGenerated || exportState === 'exporting-selected' || exportState === 'exporting-all'}
                className="w-full px-4 py-2 border flex items-center justify-center gap-2"
                style={{
                  backgroundColor: exportState === 'exported-all' ? 'rgba(10, 137, 76, 0.08)' : 'transparent',
                  color: exportState === 'exported-all' ? 'rgba(10, 137, 76, 1)' : 'var(--muted-foreground)',
                  borderColor: exportState === 'exported-all' ? 'rgba(10, 137, 76, 1)' : 'var(--border)',
                  borderRadius: 'var(--radius-button)',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: (!hasGenerated || exportState === 'exporting-selected' || exportState === 'exporting-all') ? 'not-allowed' : 'pointer',
                  opacity: (!hasGenerated || exportState === 'exporting-selected' || exportState === 'exporting-all') ? 0.7 : 1,
                }}
              >
                {exportState === 'exporting-all' && <Loader2 size={14} className="animate-spin" />}
                {exportState === 'exported-all' && <Check size={14} />}
                {exportState === 'exporting-all' ? 'Exporting...' : exportState === 'exported-all' ? 'Exported' : 'Export all variants'}
              </button>
              {(exportState === 'exported-selected' || exportState === 'exported-all') && lastExportedAt != null && (
                <div className="mt-1 text-center" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'rgba(10, 137, 76, 1)' }}>
                  Last exported: {new Date(lastExportedAt).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
        </div>

        {/* Sticky primary action: Insert to canvas (hidden in web app) */}
        {!isWebApp && (
        <div className="comms-forge-layout__insert-bar flex-shrink-0 px-5 py-3 border-t bg-[var(--background)]" style={{ borderColor: 'var(--border)', boxShadow: '0 -1px 3px rgba(0,0,0,0.06)' }}>
          {(() => {
            const insertDisabled = isDeprecated || isAddingNewTemplate || !generated || generatedStale || !hasSelectedVariants;
            const insertDisabledReason = isDeprecated
              ? 'Deprecated templates cannot be inserted.'
              : isAddingNewTemplate
                ? 'Finish or cancel the new template first.'
                : !generated
                  ? 'Generate variants first.'
                  : generatedStale
                    ? 'Outputs stale — generate again.'
                    : !hasSelectedVariants
                      ? 'Select at least one variant.'
                      : '';
            return (
              <>
                <button
                  onClick={onInsertToCanvas}
                  disabled={insertDisabled}
                  className="w-full px-4 py-2.5 flex items-center justify-center gap-2 border-none"
                  style={{
                    backgroundColor: insertDisabled ? 'var(--muted)' : 'var(--accent)',
                    color: insertDisabled ? 'var(--muted-foreground)' : 'white',
                    borderRadius: 'var(--radius-button)',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                    cursor: insertDisabled ? 'not-allowed' : 'pointer',
                    opacity: insertDisabled ? 0.8 : 1,
                  }}
                >
                  Insert to canvas
                </button>
                {insertDisabled && insertDisabledReason && (
                  <div
                    className="mt-1.5 text-center"
                    style={{
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {insertDisabledReason}
                  </div>
                )}
              </>
            );
          })()}
        </div>
        )}
        </div>

        {!isWebApp && (
        <div className="comms-forge-layout__preview px-5 py-4 flex flex-col min-h-0">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <div
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Generated outputs
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: SPACING_SECTION_GAP }}>
            <div
              className="flex p-0.5 border rounded-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', minHeight: 32 }}
            >
              {(['desktop', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  type="button"
                  onClick={() => onPreviewDeviceChange(device)}
                  className="px-2 py-1 rounded min-h-[28px] flex items-center justify-center"
                  style={{
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-xs)',
                    fontWeight: previewDevice === device ? 600 : 400,
                    color: previewDevice === device ? 'var(--foreground)' : 'var(--muted-foreground)',
                    backgroundColor: previewDevice === device ? 'var(--background)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {device === 'desktop' ? 'Desktop' : 'Mobile'}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              <input
                type="checkbox"
                checked={showWidthGuides}
                onChange={(e) => setShowWidthGuides(e.target.checked)}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              Show email width guides
            </label>
            <span style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              Device sets preview and insert width (saved).
            </span>
          </div>
          {!generatedMatches ? (
            <div
              className="p-3 border"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted-foreground)',
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Not generated yet. Click &quot;Generate variants&quot; to compute A/B/C for the current template, locale, and tone.
            </div>
          ) : generated != null ? (
            <GeneratedPreviewSection
              generated={generated}
              layoutMode={layoutMode}
              previewDevice={previewDevice}
              showWidthGuides={showWidthGuides}
              activeVariant={activePreviewVariant}
              onSelectVariant={setActivePreviewVariant}
              selectedVariants={selectedVariants}
              onVariantToggle={onVariantToggle}
              showVariantCheckboxes={false}
            />
          ) : null}
        </div>
        )}
      </div>

      {showRenameModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100 }}
          onClick={() => setShowRenameModal(false)}
        >
          <div
            className="border"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-card)',
              width: '360px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 style={{ fontFamily: 'Axiforma, sans-serif', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Rename template
              </h3>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Template name"
                className="w-full px-3 py-2 border rounded"
                style={{
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-base)',
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--foreground)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-button)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = renameValue.trim();
                  if (name) {
                    onRenameSubmit(name);
                    setShowRenameModal(false);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius-button)',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (() => {
        const t = getTemplateById(selectedTemplate);
        const templateName = (t?.name?.[locale] ?? t?.name?.['en-US'] ?? selectedTemplate) || 'this template';
        return (
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-card)',
                width: '360px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                  Delete template?
                </h3>
              </div>
              <div className="px-6 py-4" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-sm)', color: 'var(--foreground)', lineHeight: 1.45 }}>
                This will remove &quot;{templateName}&quot; from this file. You can&apos;t undo this.
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--foreground)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-button)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTemplate();
                    setShowDeleteConfirm(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    fontFamily: 'Calibre, sans-serif',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: 'var(--destructive, #dc2626)',
                    border: 'none',
                    borderRadius: 'var(--radius-button)',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showImportModal && (
        <ImportTranslationsModal
          onClose={() => setShowImportModal(false)}
          onImport={(json) => {
            onImportTranslations(json);
            setShowImportModal(false);
          }}
        />
      )}

      {showAddTranslationModal && onCreateTranslation && (
        <AddTranslationModal
          existingLocales={customTemplateLocales}
          onConfirm={(targetLocale) => {
            onCreateTranslation(targetLocale);
            setShowAddTranslationModal(false);
          }}
          onClose={() => setShowAddTranslationModal(false)}
        />
      )}
    </div>
  );
}

function formatVariantText(templateName: string, content: EmailContent): string {
  const n = normalizePlaceholderTags;
  const lines: string[] = [
    `Subject: ${n(templateName)}`,
    '',
    n(content.greeting || ''),
    '',
    n(content.body || ''),
    ...(content.footer?.trim() ? ['', n(content.footer)] : []),
    '',
    n(content.cta || ''),
    '',
    n(content.legalText || ''),
  ];
  return lines.join('\n').trim();
}

const PREVIEW_SCALE_MIN = 0.85;

function GeneratedPreviewSection({
  generated,
  layoutMode,
  previewDevice,
  showWidthGuides,
  activeVariant,
  onSelectVariant,
  selectedVariants,
  onVariantToggle,
  showVariantCheckboxes = true,
  isWebApp = false,
  contentLocale,
  selectedTemplate,
  tone,
  onPreviewEdit,
  previewOverrideVersion = 0,
}: {
  generated: GeneratedState;
  layoutMode: LayoutMode;
  previewDevice: PreviewDevice;
  showWidthGuides: boolean;
  activeVariant: Variant;
  onSelectVariant: (v: Variant) => void;
  selectedVariants: Variant[];
  onVariantToggle: (v: Variant) => void;
  showVariantCheckboxes?: boolean;
  isWebApp?: boolean;
  contentLocale?: Locale;
  selectedTemplate?: TemplateType;
  tone?: Tone;
  onPreviewEdit?: (variant: Variant, slot: import('../lib/previewOverrides').EditableSlot, value: string) => void;
  previewOverrideVersion?: number;
}) {
  const baseContent = generated.variants[activeVariant];
  const overrides =
    isWebApp && contentLocale != null && selectedTemplate != null && tone != null
      ? getPreviewOverrides({
          templateId: selectedTemplate,
          locale: contentLocale,
          variantId: activeVariant,
          layoutMode,
          tone,
        })
      : {};
  const content = isWebApp ? applyOverridesToContent(baseContent, overrides) : baseContent;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const presetWidth = PREVIEW_DEVICE_WIDTHS[previewDevice];
  const scale = viewportWidth > 0 ? Math.max(PREVIEW_SCALE_MIN, Math.min(1, viewportWidth / presetWidth)) : 1;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setViewportWidth(w);
    });
    ro.observe(el);
    setViewportWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const emailSpec = content
    ? buildEmailLayoutSpec({
        templateName: generated.templateName,
        content,
        layoutMode,
        device: previewDevice,
      })
    : null;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopyVariant = async () => {
    if (!content) return;
    const text = formatVariantText(generated.templateName, content);
    try {
      const ok = await copyToClipboard(text);
      setCopyStatus(ok ? 'ok' : 'err');
      setTimeout(() => setCopyStatus('idle'), 1500);
    } catch {
      setCopyStatus('err');
      setTimeout(() => setCopyStatus('idle'), 1500);
    }
  };

  const handleCopyAllSelected = async () => {
    const parts = selectedVariants.map((v) => {
      const c = generated.variants[v];
      return c ? `--- Variant ${v} ---\n${formatVariantText(generated.templateName, c)}` : '';
    }).filter(Boolean);
    const text = parts.join('\n\n');
    if (!text) return;
    try {
      const ok = await copyToClipboard(text);
      setCopyStatus(ok ? 'ok' : 'err');
      setTimeout(() => setCopyStatus('idle'), 1500);
    } catch {
      setCopyStatus('err');
      setTimeout(() => setCopyStatus('idle'), 1500);
    }
  };

  const variants: Variant[] = ['A', 'B', 'C'];

  return (
    <>
      <div
        style={{
          fontFamily: 'Calibre, sans-serif',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted-foreground)',
          marginBottom: SPACING_SECTION_GAP,
        }}
      >
        Generated at {new Date(generated.generatedAt).toLocaleTimeString()}.
      </div>
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden"
        style={{
          position: 'relative',
          alignItems: 'flex-start',
          ...(previewDevice === 'desktop' && { marginLeft: -48 }),
        }}
      >
        {showWidthGuides && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {(() => {
              const guideWidth = previewDevice === 'desktop' ? EMAIL_SAFE_WIDTH_DESKTOP : EMAIL_SAFE_WIDTH_MOBILE;
              const label = previewDevice === 'desktop' ? '600px' : '360px';
              return (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      marginLeft: -guideWidth / 2,
                      width: 1,
                      borderLeft: '1px dashed var(--border)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      marginLeft: guideWidth / 2 - 1,
                      width: 1,
                      borderLeft: '1px dashed var(--border)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: 4,
                      marginLeft: -guideWidth / 2,
                      fontFamily: 'Calibre, sans-serif',
                      fontSize: 10,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {label}
                  </div>
                </>
              );
            })()}
          </div>
        )}
        <div
          className="flex-shrink-0"
          style={{
            width: Math.round(presetWidth * scale),
            marginLeft: 0,
            marginRight: 'auto',
            marginTop: 0,
            marginBottom: 0,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}
        >
          <div
            style={{
              width: presetWidth,
              transformOrigin: 'top center',
              transform: `scale(${scale})`,
            }}
          >
      <div
        className="flex p-1 border rounded-md"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--muted)',
          gap: 2,
          marginBottom: SPACING_SECTION_GAP,
        }}
      >
        {variants.map((v) => {
          const isActive = activeVariant === v;
          const isRecommended = v === RECOMMENDED_VARIANT;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onSelectVariant(v)}
              className="flex-1 py-2 rounded"
              style={{
                fontFamily: 'Calibre, sans-serif',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                backgroundColor: isActive ? 'var(--background)' : isRecommended ? 'rgba(74, 74, 244, 0.12)' : 'transparent',
                border: isRecommended && !isActive ? '1px solid rgba(74, 74, 244, 0.25)' : 'none',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
      {emailSpec && (
        <div
          className="border overflow-x-hidden"
          style={{
            borderColor: 'var(--border)',
            marginBottom: SPACING_SECTION_GAP,
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {isWebApp && onPreviewEdit ? (
            <EditableEmailPreview
              spec={emailSpec}
              onEdit={(slot, value) => onPreviewEdit(activeVariant, slot, value)}
            />
          ) : (
            <RenderSpecToReact spec={emailSpec} />
          )}
        </div>
      )}
          </div>
        </div>
      <div
        className="flex gap-2 flex-wrap"
        style={{
          position: 'relative',
          zIndex: 1,
          marginBottom: SPACING_SECTION_GAP,
          ...(previewDevice === 'desktop' && { marginLeft: 48, marginTop: -72 }),
        }}
      >
        <button
          type="button"
          onClick={handleCopyVariant}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border"
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            backgroundColor: 'var(--background)',
          }}
        >
          <Copy size={12} />
          {copyStatus === 'ok' ? 'Copied' : copyStatus === 'err' ? 'Failed' : 'Copy variant'}
        </button>
        <button
          type="button"
          onClick={handleCopyAllSelected}
          disabled={selectedVariants.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border"
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-xs)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: selectedVariants.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedVariants.length === 0 ? 0.6 : 1,
            backgroundColor: 'var(--background)',
          }}
        >
          <Copy size={12} />
          Copy all selected ({selectedVariants.length})
        </button>
      </div>
      {showVariantCheckboxes && (
        <>
          <div className="mb-2" style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
            Select variants to export or copy:
          </div>
          <div className="space-y-2">
            {variants.map((v) => (
              <VariantCard key={v} variant={v} selected={selectedVariants.includes(v)} onSelect={() => onVariantToggle(v)} recommendedVariant={RECOMMENDED_VARIANT} />
            ))}
          </div>
        </>
      )}
      </div>
    </>
  );
}

const IMPORT_SUCCESS_GREEN = 'var(--success, #16a34a)';

function ImportTranslationsModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (json: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<'empty' | 'selected' | 'error'>('empty');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isJsonFile = (f: File) => {
    const n = f.name.toLowerCase();
    return n.endsWith('.json') || f.type === 'application/json';
  };

  const setFile = (f: File | null) => {
    setSelectedFile(f);
    setErrorMessage(null);
    if (!f) {
      setFileStatus('empty');
      return;
    }
    if (!isJsonFile(f)) {
      setFileStatus('error');
      setErrorMessage('Please select a .json file.');
      return;
    }
    setFileStatus('selected');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const handleImport = () => {
    if (!selectedFile || fileStatus !== 'selected') return;
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        JSON.parse(text);
        onImport(text);
      } catch {
        setErrorMessage('Import failed. Check the JSON format and try again.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const canImport = fileStatus === 'selected';
  const showSelectHelper = fileStatus === 'empty' && !errorMessage;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 16,
          width: 360,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 12 }}>
          Import translations
        </div>
        <p style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: 16, lineHeight: 1.4 }}>
          Choose a JSON file exported from this tool, then import to add it as a locale override for the selected custom template.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleInputChange}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', clip: 'rect(0,0,0,0)' }}
          aria-hidden
        />

        <div
          role="button"
          tabIndex={0}
          aria-label="Select JSON file"
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            marginBottom: 12,
            border: `1px solid ${isDragging ? 'var(--accent)' : isHover ? 'var(--foreground)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-button)',
            backgroundColor: isDragging ? 'rgba(74, 74, 244, 0.06)' : isHover ? 'var(--background)' : 'var(--muted)',
            cursor: 'pointer',
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
        >
          <FileUp size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--foreground)' }}>
              Select JSON file
            </span>
            {fileStatus === 'selected' && selectedFile && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openPicker(); }}
                style={{
                  padding: '2px 6px',
                  fontFamily: 'Calibre, sans-serif',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Change
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 12, paddingLeft: 2 }}>
          {fileStatus === 'empty' && (
            <span style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              No file selected
            </span>
          )}
          {fileStatus === 'selected' && selectedFile && (
            <span style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: IMPORT_SUCCESS_GREEN }}>
              File added: {selectedFile.name}
            </span>
          )}
        </div>

        {showSelectHelper && (
          <p style={{ fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: 16 }}>
            Select a JSON file to continue.
          </p>
        )}

        {errorMessage && (
          <div style={{ color: 'var(--destructive)', fontFamily: 'Calibre, sans-serif', fontSize: 'var(--text-xs)', marginBottom: 16 }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!canImport}
            aria-disabled={!canImport}
            title={!canImport ? 'Select a JSON file to continue.' : undefined}
            style={{
              padding: '8px 16px',
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-sm)',
              color: 'white',
              backgroundColor: canImport ? 'var(--accent)' : 'var(--muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: canImport ? 'pointer' : 'not-allowed',
              opacity: canImport ? 1 : 0.7,
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

function MetadataChip({ label }: { label: string }) {
  return (
    <div 
      className="inline-flex px-2.5 py-1 border"
      style={{
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--foreground)',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {label}
    </div>
  );
}

function StatusBadge({ isBase, onClick }: { isBase: boolean; onClick: () => void }) {
  return (
    <div 
      className="inline-flex px-2.5 py-1 border cursor-pointer"
      style={{
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
        color: isBase ? 'var(--accent)' : 'var(--foreground)',
        backgroundColor: isBase ? 'rgba(74, 74, 244, 0.08)' : 'transparent',
        borderColor: isBase ? 'var(--accent)' : 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
      onClick={onClick}
    >
      {isBase ? 'Base template' : 'Custom template'}
    </div>
  );
}

function DeprecatedBadge() {
  return (
    <div 
      className="inline-flex px-2.5 py-1 border"
      style={{
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--muted-foreground)',
        backgroundColor: 'var(--muted)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      Deprecated
    </div>
  );
}

function ToneButton({ label, selected = false, onClick }: { label: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 border"
      style={{
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: selected ? 'var(--accent)' : 'var(--foreground)',
        backgroundColor: selected ? 'rgba(74, 74, 244, 0.08)' : 'transparent',
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function VariantCard({
  variant,
  selected,
  onSelect,
  recommendedVariant,
}: {
  variant: string;
  selected: boolean;
  onSelect: () => void;
  recommendedVariant: Variant;
}) {
  const isRecommended = variant === recommendedVariant;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-1.5 w-full p-2 border text-left min-h-[32px]"
      style={{
        fontFamily: 'Calibre, sans-serif',
        fontSize: 'var(--text-xs)',
        fontWeight: selected ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
        color: selected ? 'var(--accent)' : 'var(--foreground)',
        backgroundColor: selected ? 'rgba(74, 74, 244, 0.1)' : 'var(--background)',
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        borderWidth: selected ? '2px' : '1px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
      }}
    >
      <span>Variant {variant}</span>
      {isRecommended && (
        <span
          className="inline-flex px-1 py-0.5"
          style={{
            fontSize: '10px',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--accent)',
            backgroundColor: 'rgba(74, 74, 244, 0.12)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Recommended
        </span>
      )}
    </button>
  );
}