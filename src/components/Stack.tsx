function Stack({ stackType, stack }) {
  return (
    <div className="stack">
      <h3>{stackType}</h3>
      <p key={stackType}>{stack}</p>
    </div>
  );
}

export default Stack;
