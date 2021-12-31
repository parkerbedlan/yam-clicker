import { Box, Button, Flex, Stack, Text, Tooltip } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Wrapper } from "../components/Wrapper";
import {
  MarketItem,
  useCount,
  useMarketItemsStore,
  useRate,
} from "../zustand/stores";

const Home: NextPage = () => {
  // window.localStorage.clear();
  const [count, setCount] = useCount();
  const [rate, setRate] = useRate();
  useEffect(() => {
    const secondlyRate = Math.floor(rate);
    const secondlyIncreaser = setInterval(() => {
      setCount((count) => count + secondlyRate);
    }, 1000);

    const tenSecondlyRate = Math.floor((rate - Math.floor(rate)) * 10);
    const tenSecondlyIncreaser = setInterval(() => {
      setCount((count) => count + tenSecondlyRate);
    }, 10000);

    return () => {
      clearInterval(secondlyIncreaser);
      clearInterval(tenSecondlyIncreaser);
    };
  }, [rate, setCount]);

  return (
    <>
      <Head>
        <title>Yam Clicker</title>
      </Head>
      <Wrapper>
        <Flex
          direction="column"
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text fontSize={"3xl"}>{count.toFixed(0)} yams</Text>
          <Text>per second: {rate.toFixed(1)}</Text>
          <Button
            w={56}
            h={56}
            m={4}
            onClick={() => {
              setCount(count + 1);
            }}
          >
            <Image src={"/yam.png"} width={500} height={500} alt="yam" />
          </Button>
          <Market />
        </Flex>
      </Wrapper>
    </>
  );
};

const Market = () => {
  const marketItems = useMarketItemsStore((s) => s.marketItems);
  const getCache = useMarketItemsStore((s) => s.getCache);
  useEffect(() => {
    getCache();
  }, [getCache]);
  return (
    <>
      <Box width={"100%"}>
        <Stack width={"100%"}>
          {marketItems.map((item) => (
            <MarketItem key={item.id} {...item} />
          ))}
        </Stack>
      </Box>
      {/* <pre>
        {typeof window !== "undefined" &&
          window.localStorage.getItem("marketItems") &&
          JSON.stringify(
            JSON.parse(window.localStorage.getItem("marketItems") || "") || "",
            null,
            2
          )}
      </pre>
      <pre>{JSON.stringify(marketItems, null, 2)}</pre> */}
    </>
  );
};

const MarketItem: React.FC<MarketItem> = ({
  id,
  name,
  cost,
  rateIncrease,
  unlocked,
  threshold,
  visible,
  amount,
}) => {
  const [count, setCount] = useCount();
  const [rate, setRate] = useRate();

  const purchase = useMarketItemsStore((s) => () => s.purchase(id));

  const unlock = useMarketItemsStore((s) => () => s.unlock(id));
  useEffect(() => {
    if (!unlocked && count >= cost) unlock();
  }, [count, cost, unlock, unlocked]);

  const makeVisible = useMarketItemsStore((s) => () => s.makeVisible(id));
  useEffect(() => {
    if (!visible && count >= threshold) makeVisible();
  }, [count, threshold, makeVisible, visible]);
  if (!visible) return null;

  const displayedName = unlocked ? name : "???";

  return (
    <Tooltip label={`adds ${rateIncrease} yams per second`} placement="left">
      <Box
        width={"100%"}
        border="1px"
        p="2"
        _hover={{ cursor: count >= cost ? "pointer" : "not-allowed" }}
        opacity={count >= cost ? 1 : 0.3}
        onClick={() => {
          if (count < cost) return;
          purchase();
          setCount(count - cost);
          setRate(rate + rateIncrease);
        }}
      >
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Box>
            <Text fontSize={"2xl"}>{displayedName}</Text>
            <Text>🍠{cost}</Text>
          </Box>
          <Text fontSize="2xl" mr={4}>
            {amount}
          </Text>
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default Home;
