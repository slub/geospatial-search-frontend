/**
 * Created by thomas@jung.digital on 11.05.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from 'react';
import {useCookies} from 'react-cookie';
import {ReactComponent as BasketIcon} from './Basket.svg';
import './DlfBasket.scss';

/**
 * Function component for rendering the DLF document basket.
 * @returns {*}
 */
export default function DlfBasket() {

  const [cookies] = useCookies(['dlf-requests']);
  const url = window.BasketLink ? window.BasketLink : process.env.REACT_APP_BASKET_LINK;

  function getBasketCount() {
    return cookies['dlf-requests'].length;
  }

  return (
    <div
      title="zum Warenkorb"
      className="digas-control dlf-basket"
      onClick={() => {
        window.location.href = url;
      }}
    >
      <BasketIcon/>
      {getBasketCount() !== 0 && <span className="basket-count">{getBasketCount()}</span>}
    </div>
  );
}
